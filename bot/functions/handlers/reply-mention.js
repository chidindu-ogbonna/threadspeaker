/* global exports require Promise console process */

const admin = require("firebase-admin");
const functions = require("firebase-functions");
const express = require("express");
const cors = require("cors")({ origin: true });
const { errors } = require("twitter-error-handler");
const aargh = require("aargh");

const { logEvent } = require("../services/logging");
const { createTask } = require("../services/tasks");
const { postReplyToMention } = require("../services/twitter");
const { getElapsedMins } = require("../helpers/utils");

admin.initializeApp();
const db = admin.firestore();
const dbConfig = functions.config().db;

const cacheRef = db.collection(dbConfig.cache);
const mentionsRef = db.collection(dbConfig.mentions);
const cacheTwitterRef = cacheRef.doc(dbConfig.twitter_cache);

/**
 * ### HTTP function that replies to a mention
 *
 * Triggered by a task, this function responds to a mention
 * after a requested thread has been synthesized
 *
 * @param {import('firebase-functions/lib/providers/https').Request} request
 * @param {express.response} response
 */
exports.default = async (request, response) => {
  return cors(request, response, async () => {
    console.log(request.body);
    console.log(functions.config().environment);
    if (request.method !== "POST") {
      return response.status(405).send("Method Not Allowed");
    }

    try {
      // request.body must be in `{ mentiondId, code }` format
      const { body } = request;
      const { mentionId, code } = body;

      if (!mentionId) {
        await logEvent("error", { message: "Reply-Task - mentionId missing" });
        return response.status(200).send({ code: "success" });
      }

      const twitterServiceCache = (await cacheTwitterRef.get()).data();
      const { set_at, no_reply } = twitterServiceCache;

      let shouldReply = false;
      if (no_reply && set_at) {
        const elapasedMins = getElapsedMins(new Date(), set_at.toDate());
        if (elapasedMins > 10) {
          shouldReply = true;
        }
      } else {
        shouldReply = true;
      }

      const mentionRef = mentionsRef.doc(mentionId);
      const mention = (await mentionRef.get()).data();

      const { tweet, user } = mention;
      const { id_str, in_reply_to_status_id_str: refTweet } = tweet;
      const { screen_name } = user;

      if (code === "success") {
        if (shouldReply) {
          // Reply with a success messsage
          await reply(id_str, screen_name, refTweet, { mentionId, code });
        } else {
          // Reply in 11 Mins - create a new task for 11 minutes later
          await logEvent("info", { message: "Reply in 11 mins", mentionId });
          await createTask("replyQueue", { mentionId, code }, 11);
        }

        // Kill task
        return response.status(200).send({ code: "success" });
      }

      // if (code === "bad-request") {  }

      // if (code === "no-thread") { }

      await logEvent("info", {
        message: "😥 Reply-Task Completed Without Executing",
        payload: body,
      });
      return response.status(200).send({ code: "success" });
    } catch (error) {
      await logEvent("error", { error });
      return response.status(500).send({ message: "Internal Server Error" });
    }
  });
};

/**
 * Reply to tweet. This is a wrapper that handles rate limits and retries
 *
 * @param {String} id id of the tweet of to reply to
 * @param {String} username screen name of the user to reply to
 * @param {String} refTweet the tweet that was referenced. The synthesized tweet/thread
 * @param {Object} payload payload of the current reply task
 * - {String} mentionId - id of the mention
 * - {String} code - the status of the task to be executed
 */
const reply = async (id, username, refTweet, payload) => {
  const { mentionId } = payload;
  const mentionRef = mentionsRef.doc(mentionId);

  return postReplyToMention(id, username, refTweet)
    .then(async () => {
      await mentionRef.update({ replied: true });
      await logEvent("info", { message: "Reply-Task Executed", payload });
      return;
    })
    .catch((err) => {
      return aargh(err)
        .type(errors.RateLimited, async (e) => {
          // Back off for at least 10 minutes; to avoid Twitter blocking our API access
          await logEvent("info", { error: e, info: "😰 CALM DOWN !!!" });
          await cacheTwitterRef.set(
            {
              set_at: admin.firestore.FieldValue.serverTimestamp(),
              no_reply: true,
            },
            { merge: true }
          );
          await createTask("reply-queue", payload, 11); // calm down for 11 minutes
        })
        .type(errors.BadRequest, async (e) => {
          await logEvent("error", { error: e });
        });
    });
};
