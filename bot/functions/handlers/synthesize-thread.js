/* global exports require Promise process Buffer */
const functions = require("firebase-functions");
const admin = require("firebase-admin");

const { deleteFromFileSys } = require("../helpers/utils");
const { getThread } = require("../services/twitter");
const {
  isThreadEmpty,
  parseForSynthesis,
  reduceThread,
} = require("../helpers/thread-utils");
const { logEvent } = require("../services/logging");
const { createTask } = require("../services/tasks");
const { synthesizeText } = require("../services/text-to-speech");

admin.initializeApp();
const db = admin.firestore();
const dbConfig = functions.config().db;
const storageConfig = functions.config().storage;

const cacheRef = db.collection(dbConfig.cache);
const threadsRef = db.collection(dbConfig.threads);
const cacheThreadRef = cacheRef.doc(dbConfig.threads);

/**
 * ### Firestore trigger on `mentions/{mentionId}` that responds to mentions
 *
 * Triggered when there is a write to the `mentions` collection
 *
 * In context - this is triggered when a mention is gotten by the twitter bot
 * and stored in the `mentions` collection. This trigger responds to it by:
 *
 * - Get thread associated with the mention
 * - Synthesize thread (convert thread to audio)
 * - Create task (Cloud Tasks) to respond to the user
 *
 * @param {import("firebase-functions/lib/providers/firestore").QueryDocumentSnapshot} snap
 * @param {import("firebase-functions").EventContext} context
 */
exports.default = async (snap, context) => {
  const { mentionId } = context.params;

  const { user, tweet } = snap.data();
  const { in_reply_to_status_id_str: referenceTweet } = tweet;
  const { screen_name } = user;

  // Check if a related thread has been synthesized
  const threadSnap = await threadsRef.doc(referenceTweet).get();
  if (threadSnap.exists) {
    const threadUpdate = {};
    const data = threadSnap.data();
    const { no_of_users } = data;
    if (no_of_users > 5) threadUpdate.featured = true;

    await threadSnap.ref.update({
      users: admin.firestore.FieldValue.arrayUnion(screen_name),
      no_of_users: admin.firestore.FieldValue.increment(1),
      ...threadUpdate,
    });
    await logEvent("info", {
      message: "Thread Already Synthesized",
      thread: referenceTweet,
    });

    const payload = { mentionId, code: "success" };
    const response = await createTask("reply-queue", payload, 1);
    await logEvent("info", {
      task: payload,
      message: `Reply-Task Created: ${response.name}`,
    });
    return null;
  }

  try {
    const { thread, threadAuthor } = await getThread(referenceTweet);
    const threadEmpty = isThreadEmpty(thread);

    if (threadEmpty) {
      await logEvent("info", { message: "Thread Empty", mention: mentionId });

      const payload = { mentionId, code: "no-thread" };
      const response = await createTask("reply-queue", payload, 15);
      await logEvent("info", {
        message: `Reply-Task Created: ${response.name}`,
        task: payload,
      });
      return null;
    }

    // Synthesize thread
    const parsedThread = parseForSynthesis(reduceThread(thread));
    const fileName = `${referenceTweet}.mp3`;

    let textForSpeechSynthesis;

    // watch out for extremely large threads (>5000 characters)
    const lengthOfText = parsedThread.length;
    if (lengthOfText > 5000) {
      // If this happens a lot, consider integrating splitting an audio into 2
      // for now just truncate to 5000
      textForSpeechSynthesis = parsedThread.slice(0, 5000);
      await logEvent("info", {
        message: `Thread: Split really large thread - ${lengthOfText}`,
        thread: referenceTweet,
      });
    } else {
      textForSpeechSynthesis = parsedThread;
    }

    const tempFilePath = await synthesizeText(textForSpeechSynthesis, fileName);

    // Store in cloud storage
    const bucket = admin.storage().bucket(storageConfig.bucket);
    await bucket.upload(tempFilePath, {
      destination: `${storageConfig.threads}/${fileName}`,
    });
    await deleteFromFileSys(tempFilePath);

    // Save to threads collection
    await threadsRef.doc(referenceTweet).set({
      thread,
      users: [screen_name],
      author: threadAuthor,
      created_at: admin.firestore.FieldValue.serverTimestamp(),
      no_of_users: 1,
    });
    await logEvent("info", { message: "Thread Saved", thread: referenceTweet });

    // Update mentions and cache collection
    const updateMention = snap.ref.update({ synthesized: true });
    const updateCache = cacheThreadRef.update({
      no_of_threads: admin.firestore.FieldValue.increment(1),
    });
    await Promise.all([updateCache, updateMention]);

    // Create task for reply
    const payload = { mentionId, code: "success" };
    const response = await createTask("reply-queue", payload, 1);
    await logEvent("info", {
      task: payload,
      message: `Reply-Task Created: ${response.name}`,
    });
  } catch (error) {
    // TODO: Handle Twitter RateLimitErrors 12:27 - 14 Sep, 2020
    await logEvent("error", { error, mentionId });
  }

  return null;
};
