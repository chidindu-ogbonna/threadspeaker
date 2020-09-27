/* global exports require Promise process */
const functions = require("firebase-functions");

const runtimeOptions = { timeoutSeconds: 540 };
const config = functions.config();
const dbMentions = config.db.mentions;
const dbThreads = config.db.threads;

exports.fetchMentions = functions
  .runWith({ ...runtimeOptions, memory: "1GB" })
  .pubsub.schedule("every 1 minutes") // update time based on usage
  .onRun(async (context) => {
    await (
      await Promise.resolve().then(() => require("./handlers/fetch-mentions"))
    ).default(context);
  });

exports.synthesizeThread = functions
  .runWith(runtimeOptions)
  .firestore.document(`${dbMentions}/{mentionId}`)
  .onCreate(async (snap, context) => {
    await (
      await Promise.resolve().then(() =>
        require("./handlers/synthesize-thread")
      )
    ).default(snap, context);
  });

exports.replyMention = functions
  .runWith(runtimeOptions)
  .https.onRequest(async (request, response) => {
    await (
      await Promise.resolve().then(() => require("./handlers/reply-mention"))
    ).default(request, response);
  });

exports.onThreadCreate = functions
  .runWith({ ...runtimeOptions, memory: "1GB" })
  .firestore.document(`${dbThreads}/{threadId}`)
  .onCreate(async (snap, context) => {
    await (
      await Promise.resolve().then(() => require("./handlers/on-thread-create"))
    ).default(snap, context);
  });
