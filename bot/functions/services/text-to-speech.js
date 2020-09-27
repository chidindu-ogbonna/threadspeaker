/* global require exports */

const fs = require("fs");
const util = require("util");
const textToSpeech = require("@google-cloud/text-to-speech");
const { genTempFile } = require("../helpers/utils");

const ttsClient = new textToSpeech.TextToSpeechClient();

/**
 * Synthesize string
 *
 * @param {String} text the text to be synthesized
 * @param {String} filename the id of the threa; this is the id of the last tweet in the thread
 * @returns {Promise<String>} - tempFilePath it was saved
 */
exports.synthesizeText = async (text, filename) => {
  const [response] = await ttsClient.synthesizeSpeech({
    input: { text },
    voice: { languageCode: "en-US", ssmlGender: "NEUTRAL" },
    audioConfig: { audioEncoding: "MP3" },
    // audioConfig: { audioEncoding: "MP3", pitch: 0, speakingRate: 1 },
  });

  const tempFilePath = genTempFile(filename);

  const writeFile = util.promisify(fs.writeFile);
  await writeFile(tempFilePath, response.audioContent, "binary");
  return tempFilePath;
};

/**
//  * Use language in config for text-to-speech
//  *
//  * @param {String} lang Language to use
//  */
// const useLanguage = (lang) => {
//   if (!lang) {
//     return;
//   }

//   if (lang === "english") {
//     return;
//   }

//   if (lang === "spanish") {
//     return "";
//   }
// };
