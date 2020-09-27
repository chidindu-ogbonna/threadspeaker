/* global exports require */
const util = require("util");
const fs = require("fs");
const path = require("path");
const os = require("os");
const moment = require("moment");

/**
 * Generate a custom request payload based of off HttpRequest
 * @param {Express.Request} request
 */
exports.genHttpRequest = (request) => {
  const { method, path, ip, headers } = request;
  return {
    method,
    path,
    ip,
    headers,
    url: request.originalUrl,
    userAgent: request.get("user-agent"),
  };
};

/**
 * Delete item from file system
 * @param {String} filepath path to file to be deleted
 * @returns {Promise<Boolean>} state of the action
 */
exports.deleteFromFileSys = async (filepath) => {
  const unLinkFile = util.promisify(fs.unlink);
  try {
    await unLinkFile(filepath);
    return true;
  } catch (error) {
    return false;
  }
};

/**
 * Generate temporary file path from the file
 * @param {String} filename name of file
 * @returns {String} temporary file path
 */
exports.genTempFile = (filename) => {
  const tempFilePath = path.join(os.tmpdir(), filename);
  return tempFilePath;
};

/**
 * Calculate the time (minutes) that has elapsed between 2 periods
 * @param {Date|String} periodA
 * @param {Date|String} periodB
 * @returns {Number} elapsed time in minutes
 */
exports.getElapsedMins = (periodA, periodB) => {
  const elapsedTime = moment.duration(moment(periodA) - moment(periodB));
  return elapsedTime.asMinutes();
};
