/* global require exports process Promise */

const { Logging } = require("@google-cloud/logging");
const { genHttpRequest } = require("../helpers/utils");

const logging = new Logging({ projectId: process.env.GCLOUD_PROJECT });

/**
 * Log event to stackdriver
 *
 * @param {String} type default|info|'error'
 * @param {Object} context
 *  - {String} message - not required if there's an error
 *  - {Error} error
 *  - {Express.Request} request
 * @returns {Promise}
 */
exports.logEvent = (type = "default", context = {}) => {
  const logName = "bot";
  const log = logging.log(logName);

  let severity;
  const severityOptions = ["default", "info", "error"];
  if (!severityOptions.includes(type)) {
    severity = "default";
  } else {
    severity = type;
  }

  const { message, error, request, ...rest } = context;
  const event = { ...rest };

  if (message) {
    event.message = message;
  }

  if (error) {
    event.message = error.stack;
    severity = "error";
  }

  if (request) {
    event.request = genHttpRequest(request);
  }

  const metadata = {
    resource: {
      type: "cloud_function",
      labels: {
        function_name: process.env.K_SERVICE,
        region: process.env.FUNCTION_REGION,
      },
    },
    severity: severity.toUpperCase(),
  };

  return new Promise((resolve, reject) => {
    log.write(log.entry(metadata, event), (err) => {
      if (err) return reject(err);
      return resolve();
    });
  });
};
