const cloudinary = require('cloudinary').v2;

require('dotenv').config();
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

/**
 * Uploads a file to Cloudinary in the specified folder.
 * @param {string} filePath - Local path to the file.
 * @param {string} folder - Cloudinary folder (e.g. 'profiles', 'auctions/images', 'auctions/videos')
 * @param {string} [resourceType] - 'image' or 'video'. Defaults to 'image'.
 * @returns {Promise<string>} - The Cloudinary URL of the uploaded file.
 */
const uploadToCloudinary = async (filePath, folder, resourceType = 'image') => {
  return new Promise((resolve, reject) => {
    cloudinary.uploader.upload(
      filePath,
      {
        folder,
        resource_type: resourceType,
      },
      (error, result) => {
        if (error) return reject(error);
        resolve(result.secure_url);
      }
    );
  });
};

module.exports = {
  cloudinary,
  uploadToCloudinary,
};
