/* global exports require Promise process Buffer */
const { CloudTasksClient } = require("@google-cloud/tasks");

const taskClient = new CloudTasksClient();

/**
 * Create a task in Cloud Tasks
 *
 * @param {String} queue name of the queue to add this task
 * @param {Object} payload identifier to identify what to be acted on
 * - {String} mentionId - id of the mention to reply
 * - {String} code - one of `bad-request|success|no-thread`
 * @param {Number} time scheduled time in minutes at which the task will be executed
 * @returns {Promise<google.cloud.tasks.v2.ITask>}
 */
exports.createTask = async (queue, payload, time) => {
  const project = process.env.GCLOUD_PROJECT;
  const location = "us-central1";
  const url = `https://us-central1-${project}.cloudfunctions.net/replyMention`;
  const serviceAccountEmail = `cloud-tasks@${project}.iam.gserviceaccount.com`;

  const minutes = parseInt(time) * 60000; // convert minutes to milliseconds
  const currentTime = new Date();
  const minutesLater = new Date(currentTime.getTime() + minutes);

  const convertedPayload = JSON.stringify(payload);

  const [response] = await taskClient.createTask({
    parent: taskClient.queuePath(project, location, queue),
    task: {
      httpRequest: {
        httpMethod: "POST",
        url,
        body: Buffer.from(convertedPayload).toString("base64"),
        oidcToken: { serviceAccountEmail },
        headers: {
          "Content-Type": "application/json",
        },
      },
      scheduleTime: minutesLater,
    },
  });
  return response;
};
