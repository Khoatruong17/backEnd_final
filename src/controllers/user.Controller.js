const express = require("express");
const router = express.Router();
const UserModel = require("../models/userModel");
const FacultyModel = require("../models/facultyModel");
const bcrypt = require("bcrypt");
const fs = require("fs").promises;

const checkUsername = async (username) => {
  const usernameExists = await UserModel.exists({ username: username });
  return usernameExists;
};
const getdataUser = async (req, res) => {
  try {
    const user = await UserModel.findById(req.body.user_id);
    if (!user) {
      return res.status(404).json({
        EM: "User not found",
        EC: 1,
        DT: "",
      });
    }
    const formattedUser = {
      _id: user._id,
      username: user.username,
      email: user.email,
      role: user.group?.group_name ?? null,
      faculty: user.faculty?.faculty_name ?? null,
      image: user.image,
    };
    return res.status(200).json({
      EM: "Successfully",
      EC: 0,
      DT: formattedUser,
    });
  } catch (error) {
    console.error(">>> Error getDataUser (controller)", error);
    return res.status(500).json({
      EM: `GetDataUsers failed due to error: ${error.message}`,
      EC: 1,
      DT: "",
    });
  }
};

const getAllUser = async (req, res) => {
  try {
    let filter = {};

    if (req.body.role_id) {
      filter["group.group_id"] = req.body.role_id;
    }

    if (req.body.faculty_id) {
      filter["faculty.faculty_id"] = req.body.faculty_id;
    }

    const allUsers = await UserModel.find(filter);
    const formattedUsers = allUsers.map((user) => ({
      _id: user._id,
      image: user.image,
      username: user.username,
      email: user.email,
      role: user.group.group_name,
      faculty: user.faculty.faculty_name,
    }));

    return res.status(200).json({
      EM: "Successfully",
      EC: 0,
      DT: formattedUsers,
    });
  } catch (error) {
    console.error(">>> Error getAllUser (controller)", error);
    return res.status(500).json({
      EM: "GetAllUsers failed",
      EC: 1,
      DT: "",
    });
  }
};

const editUser = async (req, res) => {
  try {
    const cookie = req.cookies;
    if (!cookie || !cookie.jwt) {
      console.log("Could not find JWT cookie");
      return res.status(401).json({
        EM: "You need to login",
        EC: 1,
        DT: "",
      });
    }
    const { user_id, faculty_id, username } = req.body;
    const user = await UserModel.findById(user_id);
    if (!user) {
      return res.status(404).json({
        EM: "User not found",
        EC: 1,
        DT: "",
      });
    }
    if (!username || username.trim() === "") {
      return res.status(400).json({
        EM: "New username is required",
        EC: 1,
        DT: "",
      });
    }

    if (username.length < 6) {
      return res.status(400).json({
        EM: "Username must be at least 6 characters long",
        EC: 1,
        DT: "",
      });
    }

    const isUserExists = await checkUsername(username);
    if (isUserExists) {
      return res.status(400).json({
        EM: "The username already exists",
        EC: 1,
        DT: "",
      });
    }

    user.username = username;
    if (faculty_id) {
      const faculty = await FacultyModel.findById(faculty_id);
      if (!faculty) {
        return res.status(404).json({
          EM: "Faculty not found",
          EC: 1,
          DT: "",
        });
      }
      user.faculty.faculty_id = faculty_id;
      user.faculty.faculty_name = faculty.faculty_name;
    }

    await user.save();

    return res.status(200).json({
      EM: "User updated successfully",
      EC: 0,
      DT: user,
    });
  } catch (error) {
    console.error(">>> Error editUser (controller)", error);
    return res.status(500).json({
      EM: "Failed to edit user",
      EC: 1,
      DT: "",
    });
  }
};

const updatePassword = async (req, res) => {
  try {
    const { id, oldPassword, newPassword, confirmPassword } = req.body;

    const user = await UserModel.findById(id);
    if (!user) {
      return res.status(404).json({
        EM: "User not found",
        EC: 1,
        DT: "",
      });
    }

    const isPasswordCorrect = await bcrypt.compare(oldPassword, user.password);
    if (!isPasswordCorrect) {
      return res.status(400).json({
        EM: "Old password is incorrect",
        EC: 1,
        DT: "",
      });
    }

    const passwordRegex = /^(?=.*[A-Z])(?=.*[!@#$%^&*])(?=.{8,})/;
    if (!passwordRegex.test(newPassword)) {
      return res.status(400).json({
        EM: "New password must contain at least one uppercase letter, one special character, and be at least 8 characters long",
        EC: 1,
        DT: "",
      });
    }
    if (newPassword !== confirmPassword) {
      return res.status(400).json({
        EM: "New password and confirm password do not match",
        EC: 1,
        DT: "",
      });
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);

    user.password = hashedPassword;
    await user.save();

    return res.status(200).json({
      EM: "Password updated successfully",
      EC: 0,
      DT: "",
    });
  } catch (error) {
    console.error(">>> Error updatePassword (controller)", error);
    return res.status(500).json({
      EM: "Failed to update password",
      EC: 1,
      DT: "",
    });
  }
};

const deleteUser = async (req, res) => {
  try {
    const { user_id, password } = req.body;
    const user = await UserModel.findOne({ _id: user_id });
    if (!user) {
      return res.status(404).json({
        EM: "User not found",
        EC: 1,
        DT: "",
      });
    }
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(401).json({
        EM: "Incorrect password, please check again!!!",
        EC: 1,
        DT: "",
      });
    }
    if (user.image) {
      const imagePath = user.image;
      try {
        fs.unlink(imagePath);
        console.log(`Image ${imagePath} has been deleted`);
      } catch (error) {
        console.log(`Error deleting image ${imagePath}: ${error}`);
      }
    }
    const result = await UserModel.findOneAndDelete({ _id: user._id });

    if (!result) {
      console.log("User not found or already deleted");
      return res.status(404).json({
        EM: "User not found or already deleted",
        EC: 1,
        DT: "",
      });
    }
    console.log("User deleted successfully");
    return res.status(200).json({
      EM: "User deleted successfully",
      EC: 0,
      DT: result,
    });
  } catch (error) {
    console.error(">>> Error deleteUser (controller)", error);
    return res.status(500).json({
      EM: "Failed to delete user",
      EC: 1,
      DT: "",
    });
  }
};

module.exports = {
  getAllUser,
  deleteUser,
  getdataUser,
  editUser,
  updatePassword,
};
