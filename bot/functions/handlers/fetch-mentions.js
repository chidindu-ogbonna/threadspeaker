/* global require exports Promise */
const functions = require("firebase-functions");
const admin = require("firebase-admin");

const { logEvent } = require("../services/logging");
const { getMentions } = require("../services/twitter");

admin.initializeApp();
const db = admin.firestore();
const dbConfig = functions.config().db;

const cacheRef = db.collection(dbConfig.cache);
const mentionsRef = db.collection(dbConfig.mentions);
const cacheMentionsRef = cacheRef.doc(dbConfig.mentions);

/**
 * ### PubSub trigger that fetches mentions `every 10 minutes`
 *
 * - This function collects every mention made to the twitter account
 * and stores in the `mentions` collection in firestore
 *
 * @param {import("firebase-functions").EventContext} context
 */
exports.default = async (context) => {
  let lastTweetId;

  const snap = await cacheMentionsRef.get();
  const { last_tweet_retrieved } = snap.data();
  if (snap.exists && last_tweet_retrieved) {
    lastTweetId = last_tweet_retrieved;
  }

  try {
    const mentions = await getMentions(lastTweetId);
    if (mentions.length) {
      const promises = mentions.map((mention) => {
        const { tweet } = mention;

        const { id_str } = tweet;
        return mentionsRef.doc(id_str).set({ ...mention });
      });
      await Promise.all(promises);

      const lastTweetId = mentions[0].tweet.id_str;
      const cacheUpdate = {
        last_tweet_retrieved: lastTweetId,
        no_of_mentions: admin.firestore.FieldValue.increment(mentions.length),
      };
      await cacheMentionsRef.update(cacheUpdate);

      await logEvent("info", {
        message: `Mentions Retrieved - ${mentions.length}`,
      });
    } else {
      await logEvent("info", { message: `Mentions Retrieved - 0` });
    }
  } catch (error) {
    // TODO: Handle Twitter RateLimitErrors 12:27 - 14 Sep, 2020
    await logEvent("error", { error });
  }

  return null;
};
