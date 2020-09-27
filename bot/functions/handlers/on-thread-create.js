/* global exports require Promise */
const admin = require("firebase-admin");
const functions = require("firebase-functions");

const { logEvent } = require("../services/logging");
const { genPreviewImage } = require("../services/puppeteer");
const { uploadPreviewImageToCloudinary } = require("../services/cloudinary");
const { deleteFromFileSys } = require("../helpers/utils");
const { getThreadOembed } = require("../services/twitter");

admin.initializeApp();
const config = functions.config();
const clientApp = config.environment.client_app;

/**
 * ### Firestore trigger on `threads/{threadId}` that responds to a created thread
 *
 * This functions creates a screenshot of a thread metadata for social sharing
 * - Gets the embed tweets
 * - Uses Puppeteer to generate the screenshot
 * - Stores it in Cloudinary
 *
 * @param {import("firebase-functions/lib/providers/firestore").QueryDocumentSnapshot} snap
 * @param {import("firebase-functions").EventContext} context
 */
exports.default = async (snap, context) => {
  const { threadId } = context.params;
  const { author, thread } = snap.data();

  getThreadOembed(thread, author)
    .then((oembed) => {
      return snap.ref.update({ oembed });
    })
    .catch((error) => {
      return logEvent("error", { error, info: "Could not get thread oembed" });
    });

  try {
    const url = `https://threadspeaker-dot-datahorror.appspot.com/thread/${threadId}`;
    // const url = `${clientApp}/thread/${threadId}`;

    const tempFilePath = await genPreviewImage(url);
    const uploadURL = await uploadPreviewImageToCloudinary(
      tempFilePath,
      threadId
    );
    await deleteFromFileSys(tempFilePath);

    // Store in database
    await snap.ref.update({ preview_image: uploadURL });
  } catch (error) {
    await logEvent("error", { error });
  }
  return null;
};
