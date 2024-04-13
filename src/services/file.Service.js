const path = require("path");

const uploadImageUser = async (image) => {
  if (!image || !image.name || typeof image.name !== "string") {
    return {
      EM: "Image information missing or invalid",
      EC: 1,
    };
  }

  // Check if the file is an image
  const allowedImageTypes = /(\.jpg|\.jpeg|\.png|\.gif)$/i;
  if (!allowedImageTypes.test(path.extname(image.name))) {
    return {
      EM: "Only image files are allowed (JPEG, JPG, PNG, GIF)",
      EC: 1,
    };
  }

  let uploadPath = path.resolve(__dirname, "../public/images");

  let extName = path.extname(image.name);
  let basename = path.basename(image.name, extName);

  let finalName = `${basename} - ${Date.now()}${extName}`;
  let finalPath = `${uploadPath}/${finalName}`;

  try {
    await image.mv(finalPath);
    return {
      EM: "Image uploaded successfully",
      EC: 0,
      DT: {
        path: finalPath,
      },
    };
  } catch (error) {
    console.log("Error uploading image:", error);
    return {
      EM: "An error occurred while uploading the image",
      EC: 1,
    };
  }
};

const uploadSingleFile = async (file) => {
  if (!file || typeof file.name !== "string") {
    return {
      EM: "File information missing or invalid",
      EC: 1,
    };
  }
  let uploadPath = path.resolve(__dirname, "../public/upload");

  let extName = path.extname(file.name);
  let basename = path.basename(file.name, extName);

  let finalName = `${basename} - ${Date.now()}${extName}`;
  let finalPath = `${uploadPath}/${finalName}`;

  try {
    await file.mv(finalPath);
    return {
      EM: "File uploaded successfully",
      EC: 0,
      DT: {
        path: finalPath,
      },
    };
  } catch (error) {
    console.log(">> Check error (service single): " + error);
    return {
      EM: "File upload failed ",
      EC: 1,
    };
  }
};

const uploadMultipleFiles = async (file) => {
  try {
    let uploadPath = path.resolve(__dirname, "../public/upload");
    let resultArr = [];
    let countSuccess = 0;
    for (let i = 0; i < file.length; i++) {
      let extname = path.extname(file[i].name);
      let basename = path.basename(file[i].name, extname);

      let finalName = `${basename} - ${Date.now()}${extname}`;
      let finalPath = `${uploadPath}/${finalName}`;

      try {
        await file[i].mv(finalPath);
        resultArr.push({
          status: "success",
          path: finalPath,
          fileName: file[i].name,
          error: null,
        });
        countSuccess++;
      } catch (error) {
        resultArr.push({
          status: "failed",
          path: null,
          fileName: file[i].name,
          error: JSON.stringify(error),
        });
      }
    }

    return {
      countSuccess: countSuccess,
      detail: resultArr,
    };
  } catch (error) {
    console.log(">> Check error (service multiple): " + error);
    return {
      EM: "File upload failed",
      EC: 1,
    };
  }
};

module.exports = {
  uploadSingleFile,
  uploadMultipleFiles,
  uploadImageUser,
};
