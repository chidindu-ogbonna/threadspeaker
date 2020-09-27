/* global require */
const { runtimeConfig } = require("../test-config");
const functions = require("../index");
const admin = require("firebase-admin");
const { mention: mockMention, mention } = require("./data");

const test = require("firebase-functions-test")({
  databaseURL: "https://datahorror-b9cd4.firebaseio.com",
  storageBucket: "datahorror.appspot.com",
  projectId: "datahorror",
});

test.mockConfig(runtimeConfig);

const snap = test.firestore.makeDocumentSnapshot(
  mockMention,
  "document/test-mentions"
);
const wrapped = test.wrap(functions.synthesizeThread);
wrapped(snap, { params: { mentionId: mention.tweet.id_str } })
  .then(async () => {
    const db = admin.firestore();

    return db.collection("test-mentions").doc(mention.tweet.id_str);
  })
  .catch((error) => {});
