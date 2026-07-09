const cloudinary = require("cloudinary").v2;

cloudinary.config({
  cloud_name: "dqfhn7rw3",
  api_key: "382695276612379",
  api_secret: "3XWIpGNiRSe2K2Cs2t9-fUtPPY0",
});

// Notice we changed 'files' to 'file' (singular)
exports.uploadImage = async (file) => {
  return new Promise((resolve, reject) => {
    // We use upload_stream to read the file.data Buffer directly from memory
    const uploadStream = cloudinary.uploader.upload_stream(
      { folder: "task_manager" }, // Optional: puts images in a specific folder on Cloudinary
      (error, result) => {
        if (error) {
          console.error("Cloudinary Stream Error:", error);
          reject(error);
        } else {
          resolve(result); // Returns the successful Cloudinary object
        }
      },
    );

    // This pushes the raw image data into Cloudinary
    uploadStream.end(file.data);
  });
};
