const validator = require("validator");
require("dotenv").config();
const User = require("../models/userModel");
const GroupModel = require("../models/groupModel");
const FacultyModel = require("../models/facultyModel");
const bcrypt = require("bcrypt");
const getGWR = require("../services/jwt.Service");
const uploadFile = require("../services/file.Service");
const JWTaction = require("../middleware/jwtAction");
const path = require("path");

//---------------- Register ------------------
const hashUserPassword = async (password) => {
  try {
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(password, saltRounds);
    return hashedPassword;
  } catch (error) {
    console.error("Error hashing password:", error);
    throw error;
  }
};

// check user email
const checkEmail = async (userEmail) => {
  const emailExists = await User.findOne({ email: userEmail });
  if (emailExists) {
    return true;
  }
  return false;
};

// check user username
const checkUsername = async (username) => {
  const usernameExists = await User.findOne({ username: username });
  if (usernameExists) {
    return true;
  }
  return false;
};

const isPasswordStrong = (password) => {
  const uppercaseRegex = /[A-Z]/;
  const lengthRegex = /.{8,}/;
  const specialCharRegex = /[!@#$%^&*(),.?":{}|<>]/;
  const numberRegex = /\d/;

  return (
    uppercaseRegex.test(password) &&
    lengthRegex.test(password) &&
    specialCharRegex.test(password) &&
    numberRegex.test(password)
  );
};

const registerNewUser = async (req) => {
  try {
    const isEmail = validator.isEmail(req.body.email);
    if (isEmail) {
      let isEmailExists = await checkUsername(req.body.username);
      if (isEmailExists == true) {
        return {
          EM: "The username already exists",
          EC: 1,
        };
      }
      let isUsernameExists = await checkEmail(req.body.email);
      if (isUsernameExists == true) {
        return {
          EM: "The email already exists",
          EC: 1,
        };
      }

      if (!isPasswordStrong(req.body.password)) {
        return {
          EP: "Password needs 1 uppercase letter, 1 special character, 1 digit, and minimum 8 characters.",
          EC: 1,
        };
      }

      let hashPassword = await hashUserPassword(req.body.password);
      // find roles by id
      const find_group = await GroupModel.findById(req.body.group_id).populate(
        "_id"
      );
      if (!find_group) {
        return {
          EM: "Cannot find group",
          EC: 1,
        };
      }

      // create new user
      const user = new User({
        username: req.body.username,
        email: req.body.email,
        password: hashPassword,
        group: {
          group_id: find_group._id,
          group_name: find_group.group_name,
        },
        //image: imageUploadResult.DT.path,
      });

      if (req.body.faculty_id) {
        const find_faculty = await FacultyModel.findById(req.body.faculty_id);
        if (!find_faculty) {
          return {
            EM: "Can't find Faculty",
            EC: 1,
          };
        }
        user.faculty = {
          faculty_id: find_faculty._id,
          faculty_name: find_faculty.faculty_name,
        };
      }

      if (req.files && req.files.image) {
        const image = req.files.image;
        const allowedImageTypes = /(\.jpg|\.jpeg|\.png|\.gif)$/i;
        if (!allowedImageTypes.test(path.extname(image.name))) {
          throw new Error("Only image files are allowed (JPEG, JPG, PNG, GIF)");
        }
        try {
          let result_image = await uploadFile.uploadImageUser(image);
          if (result_image.EC === 0) {
            user.image = result_image.DT.path;
          } else {
            throw new Error("An error occurred while uploading the image");
          }
        } catch (error) {
          console.log("Error uploading image:", error);
          throw new Error("An error occurred while uploading the image");
        }
      }
      try {
        const result = await user.save();
        console.log(result);
        return {
          EM: "User created successfully",
          EC: 0,
          DT: result,
        };
      } catch (err) {
        console.error("Error creating user:", err);
      }
    } else {
      return {
        EM: "Invalid email address",
        EC: 1,
        DT: "",
      };
    }
  } catch (e) {
    console.log(">>> Error register new user (service): " + e.message);
    return {
      EM: "Something Wrong with server",
      EC: 1,
    };
  }
};

//---------------- Login ------------------
//check legnth of password
const isPasswordLength = (password) => {
  return password.length >= 8;
};

const checkPassword = (inputPassword, hashPassword) => {
  return bcrypt.compareSync(inputPassword, hashPassword);
};

const UserLogin = async (rawData) => {
  try {
    // Check if email and password are not empty
    if (!rawData.email || !rawData.password) {
      return {
        EM: "Email and password must not be empty",
        EC: 1,
        DT: "",
      };
    }

    // Check if password length is between 8 and 10

    // Check if email length is between 50 and 255
    // if (rawData.email.length < 10 || rawData.email.length > 55) {
    //   return {
    //     EM: "Email must be between 50 and 255 characters",
    //     EC: 1,
    //     DT: "",
    //   };
    // }

    const isEmail = validator.isEmail(rawData.email);
    if (isEmail) {
      let user = await User.findOne({ email: rawData.email });
      if (user) {
        let IsCorrectPass = checkPassword(rawData.password, user.password);
        if (IsCorrectPass === true) {
          let groupWithRole = await getGWR.GetGroupWithRole(user);
          let tokenJWT = await JWTaction.createJWT({
            id: user._id,
            email: user.email,
            groupWithRole,
            faculty_id: user.faculty ? user.faculty.faculty_id : null,
          });
          return {
            EM: "Login successful",
            EC: 0,
            DT: {
              access_token: tokenJWT,
              expiresIn: process.env.JWT_EXPIRES_IN,
              data: {
                id: user._id,
                username: user.username,
                groupWithRole,
                faculty_id: user.faculty ? user.faculty.faculty_id : null,
              },
            },
          };
        }
      }
      return {
        EM: "Your email or password is incorrect",
        EC: 1,
        DT: "",
      };
    } else {
      return {
        EM: "user name is not a email or is not email",
        EC: 1,
        DT: "",
      };
    }
  } catch (e) {
    console.log(">>> Error login user (service): " + e.message);
    return {
      EM: "Something Wrong with server",
      EC: 10,
    };
  }
};

module.exports = {
  registerNewUser,
  UserLogin,
};
