/* global require Promise exports console */
const functions = require("firebase-functions");
const cloudinary = require("cloudinary").v2;

const environment = functions.config().environment;
const cloudinaryConfig = functions.config().cloudinary;
cloudinary.config({
  cloud_name: cloudinaryConfig.cloud_name,
  api_key: cloudinaryConfig.api_key,
  api_secret: cloudinaryConfig.api_secret,
});

const isTest = environment.name === "test";

/**
 * Upload preview image to cloudinary
 *
 * @param {String} image path to image
 * @param {String} id identifier of the asset to store
 * @return {Promise<String>} url of the stored asset
 */
exports.uploadPreviewImageToCloudinary = (image, id) => {
  return uploadToCloudinary(image, id, "threadspeaker/card-previews");
};

/**
 * Upload image to cloudinary
 *
 * @param {String} image path to image
 * @param {String} id the identifier of the asset to store
 * @param {String} folder where to be stored in cloudinary
 * @return {Promise<String>} the url of the stored asset
 */
const uploadToCloudinary = (image, id, folder) => {
  let envFolder;

  const folderSplit = folder.split("/");
  const base = folderSplit[0];
  const path = folderSplit[folderSplit.length - 1];

  if (isTest) {
    envFolder = `${base}/test-${path}`;
  } else {
    envFolder = `${base}/${path}`;
  }

  return new Promise((resolve, reject) => {
    cloudinary.uploader.upload(
      image,
      { public_id: id, folder: envFolder },
      (error, result) => {
        if (error) reject(error);
        if (result) resolve(result.secure_url);
      }
    );
  });
};
