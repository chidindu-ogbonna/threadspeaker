/* global require exports Promise */

const Twit = require("twit");
const functions = require("firebase-functions");

const TweetRefinery = require("./tweet-refinery");
const { sortThread } = require("../../helpers/thread-utils");
const { wrapTwitterErrors } = require("twitter-error-handler");

const config = functions.config();
const environment = config.environment;
const clientApp = environment.client_app;
const twitterConfig = config.twitter;
const twit = new Twit({
  consumer_key: twitterConfig.consumer_key,
  consumer_secret: twitterConfig.consumer_secret,
  access_token: twitterConfig.access_token,
  access_token_secret: twitterConfig.access_token_secret,
  strictSSL: true,
});

const SUPPORTED_LANG = ["arabic", "french", "spanish", "italian", "portuguese"];

/**
 *
 * @param {String} lastTweetRetrieved id of the last tweet retrieved
 * @returns {Promise<Array>} array of tweets retrieved. Refined using the tweet refinery
 */
exports.getMentions = async (lastTweetRetrieved) => {
  const endpoint = "statuses/mentions_timeline";
  const options = {
    include_entities: true,
    tweet_mode: "extended",
    count: 200,
  };

  if (lastTweetRetrieved) {
    options.since_id = lastTweetRetrieved;
  }

  const results = await twit.get(endpoint, options);
  const { data, resp } = results;
  // console.log(data);

  const mentions = data
    .map((value) => {
      const { tweet, user, isTweetAReplyToMe } = new TweetRefinery(value);

      return { tweet, user, isTweetAReplyToMe };
    })
    .filter((value) => !value.isTweetAReplyToMe); // ignore replies to me
  return mentions;
};

/**
 * Get the thread associated with the tweet
 * @param {String} id of the tweet - particularly the id of the last tweet in a thread
 * @returns {Promise<Object>} thread
 */
exports.getThread = async (id) => {
  const thread = [];
  let threadAuthor;

  const getTweet = async (id) => {
    const endpoint = "statuses/show";
    const options = { id, tweet_mode: "extended", include_entities: true };
    const results = await twit.get(endpoint, options);
    const { data, resp } = results;

    const { tweet, user, isTweetFromThread } = new TweetRefinery(data);

    if (!threadAuthor) threadAuthor = user;
    thread.push(tweet);

    if (isTweetFromThread) {
      const tweetAboveId = tweet.in_reply_to_status_id_str;
      await getTweet(tweetAboveId);
    }

    return isTweetFromThread;
  };

  const isTweetFromThread = await getTweet(id);

  return { thread: sortThread(thread), threadAuthor, isTweetFromThread };
};

/**
 * Get the oembed for every tweet in a thread
 *
 * @param {Array} thread - array of tweets
 * @param {Object} author - author of the thread
 * @returns {Promise<Array>}
 */
exports.getThreadOembed = async (thread, author) => {
  const endpoint = "statuses/oembed";
  const options = {
    omit_script: true,
    dnt: true,
    hide_thread: true,
    link_color: "#007aff",
  };
  const username = author.screen_name;

  const promises = thread.map((tweet) => {
    options.url = `https://twitter.com/${username}/status/${tweet.id_str}`;
    return twit.get(endpoint, options);
  });

  return Promise.all(promises)
    .then((response) => {
      return response.map((value) => {
        const { data } = value;
        const { html: raw_html } = data;
        const html = raw_html.replace("\n", "");
        return html;
      });
    })
    .catch((error) => {
      if (error.code === 34) return [];
      return wrapTwitterErrors(error, "status/oembed");
    })
    .catch((err) => {
      throw err;
    });
};

/**
 * Post reply to a mention
 *
 * @param {String} id id of tweet to reply to
 * @param {String} username screen name of the user to reply to
 * @param {String} refTweet content of the reply tweet
 */
exports.postReplyToMention = (id, username, refTweet) => {
  const link = `${clientApp}/thread/${refTweet}`;
  const response = randomSuccessResponse(link);

  const replyOptions = {
    in_reply_to_status_id: id,
    status: `@${username} ${response}`,
    auto_populate_reply_metadata: true,
  };
  return postTweet(replyOptions);
};

const postTweet = async (options) => {
  const endpoint = "statuses/update";
  return twit
    .post(endpoint, options)
    .catch((err) => wrapTwitterErrors(endpoint, err))
    .catch((err) => {
      throw err;
    });
};

const randomSuccessResponse = (link) => {
  const responses = [
    `Here's the audio 🎵 to this thread: ${link}`,
    `Hey, here's the audio 🎵 ${link} \nNice thread btw 🤗`,
    `You can listen to this thread here: ${link} \n Enjoy!! 😊`,
  ];
  const response = responses[Math.floor(Math.random() * responses.length)];
  return response;
};

// /**
//  * Detect the language indicated in the mention
//  *
//  * @param {String} text the mention
//  */
// const detectLanguage = (text) => {
//   const selectedLang = SUPPORTED_LANG.filter((lang) => text.includes(lang));

//   let lang;
//   if (selectedLang.length) {
//     lang = selectedLang[0]; // select the first language indicated
//   } else {
//     lang = "english"; // default language
//   }

//   return lang;
// };
