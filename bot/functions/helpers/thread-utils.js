/* global require exports */

const emojiStrip = require("emoji-strip");

/**
 * Sort the thread according to dates in descending order
 *
 * @param {Array} thread a list of tweets
 * @returns {Array} sorted array
 */
exports.sortThread = (thread) => {
  const sorted = thread.sort((a, b) => b.created_at - a.created_at);
  return sorted.reverse();
};

/**
 * Reduce the thread to one value to be synthesized
 *
 * @param {Array} thread a list of tweets
 */
exports.reduceThread = (thread) => {
  const reducer = (total, tweet) => {
    return total + "." + tweet.full_text;
  };
  return thread.reduce(reducer, "");
};

/**
 * Check if thread is empty
 *
 * @param {Array} thread a list of tweets
 * @returns {Boolean} is thread empty or not
 */
exports.isThreadEmpty = (thread) => {
  if (thread.length) return false;
  return true;
};

/**
 * Prepare text for synthesis.
 * - remove urls
 * - remove break tags
 * - remove emojis
 *
 * @param {String} text
 * @returns {String} parsed text
 */
exports.parseForSynthesis = (text) => {
  // Remove urls
  const removeURLs = text
    .replace(/(?:https?|ftp):\/\/[\n\S]+/g, "")
    .replace(/t\.co\S+/g, "");

  // Remove break tags
  const removeBreaks = removeURLs.replace(/<br>/g, "");

  // Remove emojis
  return emojiStrip(removeBreaks);
};
