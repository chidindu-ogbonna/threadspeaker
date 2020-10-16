/* global require module */
const functions = require("firebase-functions");
const twitterConfig = functions.config().twitter;

class TweetRefinery {
  /**
   * Refine the tweet object gotten from the twitter api
   *
   * @param {Object} tweetObject raw twitter object
   */
  constructor(tweetObject) {
    this.rawTweetObject = tweetObject;
  }

  get user() {
    const { user } = this.rawTweetObject;
    const {
      id_str,
      name,
      url,
      location,
      verified,
      profile_image_url_https,
      followers_count,
      friends_count,
      created_at,
      favourites_count,
      description,
      statuses_count,
    } = user;

    return {
      id_str,
      name,
      screen_name: user.screen_name.toLowerCase(),
      location,
      url,
      verified,
      profile_image_url_https,
      followers_count,
      friends_count,
      // protected is a keyword,
      protected: user.protected,
      created_at: new Date(created_at),
      description,
      favourites_count,
      statuses_count,
    };
  }

  get tweet() {
    const {
      created_at,
      id_str,
      full_text,
      text,
      in_reply_to_status_id_str,
      in_reply_to_user_id_str,
      in_reply_to_screen_name,
      is_quote_status,
      entities,
    } = this.rawTweetObject;

    let parsedText;
    if (full_text) {
      parsedText = refineText(full_text);
    } else {
      parsedText = refineText(text);
    }

    return {
      created_at: new Date(created_at),
      ...refineEntities(entities),
      id_str,
      full_text: parsedText,
      in_reply_to_status_id_str,
      in_reply_to_user_id_str,
      in_reply_to_screen_name,
      is_quote_status,
    };
  }

  get isTweetFromThread() {
    // if the author replied to it's own tweet
    return this.user.id_str === this.tweet.in_reply_to_user_id_str;
  }

  get isMyTweet() {
    return this.user.id_str === twitterConfig.twitter_id;
  }

  get isTweetAReplyToMe() {
    return this.tweet.in_reply_to_user_id_str === twitterConfig.twitter_id;
  }
}

/**
 * Refine texts.
 * Replacing \n with <br> and \t with ''
 *
 * @param {String} text
 * @returns {String}
 */
const refineText = (text) => {
  return text.replace(/\n/g, "<br>").replace(/\t/g, "");
};

/**
 * Refine entities
 *
 * @param {Object} entities
 * @returns {Object}
 */
const refineEntities = (entities) => {
  const { urls, media } = entities;

  let entityURLs;
  let entityMedia;

  if (urls) {
    entityURLs = urls.map((url) => url.expanded_url);
  } else {
    entityURLs = [];
  }

  if (media) {
    entityMedia = media.map((item) => item.media_url_https);
  } else {
    entityMedia = [];
  }

  return { media: entityMedia, urls: entityURLs };
};

module.exports = TweetRefinery;
