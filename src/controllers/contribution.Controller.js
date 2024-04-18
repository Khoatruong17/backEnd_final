const express = require("express");
const Contributions = require("../models/contributionModel");
const jwtAction = require("../middleware/jwtAction");
const uploadFile = require("../controllers/file.Controller");
const Topic = require("../models/topicModel");
const User = require("../models/userModel");
const Faculty = require("../models/facultyModel");
const sendEmailMessage = require("../services/sendMail.Service");
const Contribution = require("../models/contributionModel");
const Comments = require("../models/commentModel");
const fs = require("fs").promises;
const expressZip = require("express-zip");
const path = require("path");
const timeSevice = require("../services/time.Service");

const findUser = async (topic_id) => {
  try {
    const topic = await Topic.findById(topic_id);
    if (!topic) {
      throw new Error("Topic not found");
    }
    const user = await User.findById(topic.user.user_id);
    if (!user) {
      throw new Error("User not found");
    }
    return user;
  } catch (error) {
    console.log("Error finding user by topic_id: " + error);
    throw error;
  }
};

const timeRemaining = (submit_date) => {
  const submit = new Date(submit_date);
  const deadline = new Date(submit.getTime() + 14 * 24 * 60 * 60 * 1000); // 14 days from submit_date
  const now = new Date();

  const diff = Math.abs(now - deadline); // absolute difference in milliseconds

  const days = Math.floor(diff / (24 * 60 * 60 * 1000)); // convert difference to days
  const hours = Math.floor((diff % (24 * 60 * 60 * 1000)) / (60 * 60 * 1000)); // convert the remaining difference to hours

  if (now > deadline) {
    return `Deadline exceeded by ${days} days ${hours} hours, you cannot comment.`;
  } else {
    return `${days} days ${hours} hours remaining to comment.`;
  }
};

const timeRemainingStudent = (deadline, submit_date) => {
  try {
    const submit = new Date(submit_date);
    const deadlineDate = new Date(deadline);
    const now = new Date();

    const earlyTime = Math.abs(deadlineDate - submit);
    const earlyTime_days = Math.floor(earlyTime / (24 * 60 * 60 * 1000));
    const earlyTime_hours = Math.floor(
      (earlyTime % (24 * 60 * 60 * 1000)) / (60 * 60 * 1000)
    );

    if (now > deadlineDate) {
      const overTime = Math.abs(now - deadlineDate);
      const overTime_days = Math.floor(overTime / (24 * 60 * 60 * 1000));
      const overTime_hours = Math.floor(
        (overTime % (24 * 60 * 60 * 1000)) / (60 * 60 * 1000)
      );
      return `Deadline has passed. It has been ${overTime_days} days and ${overTime_hours} hours since the deadline.`;
    }

    if (now > submit) {
      return `You have submitted ${earlyTime_days} days and ${earlyTime_hours} hours early.`;
    }

    const diff = Math.abs(deadlineDate - now);
    const days = Math.floor(diff / (24 * 60 * 60 * 1000));
    const hours = Math.floor((diff % (24 * 60 * 60 * 1000)) / (60 * 60 * 1000));

    return `${days} days and ${hours} hours remaining to submit.`;
  } catch (error) {
    console.log("Error calculating time remaining for student " + error);
    throw error;
  }
};

const createContribution = async (req, res) => {
  try {
    if (!req.files || Object.keys(req.files).length === 0) {
      return res.status(400).send("No files were uploaded.");
    }
    let cookie = req.cookies;
    if (!cookie || cookie.length === 0) {
      return res.status(400).send("No cookies found. Please Login!!!");
    }
    const decoded = jwtAction.verifyToken(cookie.jwt);
    console.log("Bat loi", cookie.jwt);
    if (!decoded) {
      return res.status(400).send("Invalid cookie. Please Login!!!");
    }
    const student_id = decoded.id;

    const student = await User.findById(student_id);
    if (!student) {
      throw new Error(
        "Student not found, please check token (take student_id by token)"
      );
    }
    const faculty_id = student.faculty.faculty_id;
    if (!faculty_id) {
      throw new Error("The user does not have faculty_id, please check again");
    }

    const topic_id = req.body.topic_id;
    const topic = await Topic.findById(topic_id);
    if (!topic) {
      throw new Error("Topic not found, please check topic_id");
    }
    const deadline = new Date(topic.end_date);
    if (deadline < new Date()) {
      throw new Error(
        "The deadline has passed, you can't submit your contribution anymore."
      );
    }
    const email = "namdhgch190700@fpt.edu.vn";

    const filePath = await uploadFile.postUploadMultipleFiles(req);
    let documents = [];
    let countSuccess;
    console.log(filePath);
    if (Array.isArray(filePath.detail)) {
      documents = filePath.detail.map((detail) => detail.path);
      countSuccess = filePath.countSuccess;
    } else if (filePath.DT.path) {
      documents = filePath.DT.path;
      countSuccess = 1;
    } else {
      console.error("filePath.detail or filePath.path is not available.");
      return res.status(400).send("Invalid file upload data.");
    }
    const currentDate = new Date();

    console.log(">>> File Path", documents);
    //console.log({filePath,currentDate,student_id,topic_id});
    const newContribution = new Contributions({
      user_id: student_id,
      topic_id: topic_id,
      topic_name: topic.name,
      faculty_id: faculty_id,
      name: req.body.name,
      description: req.body.description,
      document: documents,
      submit_date: currentDate,
      status: 0,
    });
    const contribution = await newContribution.save();
    if (contribution) {
      const user = await User.findById(student_id);
      let text = `The student "${user.email}" upload ${countSuccess} contribution to the system`;
      let email_status = await sendEmailMessage.sendEmail(email, text);
      console.log(email_status);
    }

    console.log("Add contribution Successfully");
    return res.status(200).json({
      message: "Add contribution Successfully",
      contribution: contribution, // Optionally, you can return the created contribution
    });
  } catch (error) {
    console.log("Error create contribution --: " + error);
    res.status(500).json({ error: error.message });
  }
};

const getAllContribution = async (req, res) => {
  try {
    const contributions = [];
    const contribution = await Contributions.find();
    for (const item of contribution) {
      const timeSubmit = timeSevice.convertToGMT7(
        item.submit_date.toISOString()
      );
      const remainingTime = await timeRemaining(item.submit_date);
      contributions.push({
        contribution: item,
        timeSubmit: timeSubmit,
        remainingTimetoComment: remainingTime,
      });
    }
    res.status(200).json(contribution);
    console.log("Get all contributions successfully");
  } catch (error) {
    console.log("Error get all contributions: " + error);
    res.status(500).json({ error: error.message });
  }
};

const showcontributionbyFaculty = async (req, res) => {
  try {
    const cookie = req.cookies;
    if (!cookie.jwt || cookie.length === 0) {
      return res.status(400).send("No cookies found. Please Login!!!");
    }
    const decoded = jwtAction.verifyToken(cookie.jwt);
    const faculty_id = decoded.faculty_id;
    const faculty = await Faculty.findById(faculty_id);
    if (!faculty) {
      throw new Error("Faculty not found, please check faculty_id");
    }
    const contributionsWithRemainingTime = [];
    const contribution = await Contributions.find({
      faculty_id: faculty._id,
    });
    if (!contribution) {
      throw new Error("Contribution not found (find by faculty_id)");
    }
    for (const item of contribution) {
      const timeSubmit = timeSevice.convertToGMT7(
        item.submit_date.toISOString()
      );
      const remainingTime = await timeRemaining(item.submit_date);
      contributionsWithRemainingTime.push({
        contribution: item,
        timeSubmit: timeSubmit,
        remainingTimetoComment: remainingTime,
      });
    }
    const status = req.body.status;
    //const status_contribution = await contribution.find({ status: status });
    if (status) {
      const contributionByStatus = await Contributions.find({
        faculty_id: faculty._id,
        status: status,
      });
      for (const item of contributionByStatus) {
        const remainingTime = await timeRemaining(item.submit_date);
        contributionsWithRemainingTime.push({
          contribution: item,
          remainingTimetoComment: remainingTime,
        });
      }
      return res.status(200).json({
        EM: "success (get by status)",
        EC: 0,
        DT: {
          contributionsWithRemainingTime,
        },
      });
    }
    return res.status(200).json({
      EM: "success",
      EC: 0,
      DT: {
        contributionsWithRemainingTime,
      },
    });
  } catch (error) {
    console.log("Error get contribution by  --: " + error);
    res.status(500).json({ error: error.message });
  }
};

const showcontributionForStudent = async (req, res) => {
  try {
    const cookie = req.cookies;
    if (!cookie || !cookie.jwt) {
      return res.status(400).send("No cookies found. Please Login!!!");
    }
    const decoded = jwtAction.verifyToken(cookie.jwt);
    const faculty_id = decoded.faculty_id;
    const student_id = decoded.id;
    const faculty = await Faculty.findById(faculty_id);
    if (!faculty) {
      throw new Error("Faculty not found, please check faculty_id");
    }
    const contributionsWithRemainingTime = [];
    const contribution = await Contributions.find({
      faculty_id: faculty._id,
      user_id: student_id,
      status: { $in: [0, 1] },
    });
    if (!contribution) {
      throw new Error("Contribution not found (find by faculty_id)");
    }
    for (const item of contribution) {
      const topic = await Topic.findById(item.topic_id).exec();
      if (!topic) {
        throw new Error("Topic not found");
      }
      const timeSubmit = timeSevice.convertToGMT7(
        item.submit_date.toISOString()
      );
      const endDate = topic.end_date;
      if (endDate) {
        const remainingTime = await timeRemainingStudent(
          endDate,
          item.submit_date
        );
        contributionsWithRemainingTime.push({
          contribution: item,
          timeSubmit: timeSubmit,
          remainingTimetoSubmit: remainingTime,
        });
      }
    }
    return res.status(200).json({
      EM: "success",
      EC: 0,
      DT: {
        contributionsWithRemainingTime,
      },
    });
  } catch (error) {
    console.log("Error get contribution for Student  --: " + error);
    res.status(500).json({ error: error.message });
  }
};

const showcontributionForGuest = async (req, res) => {
  try {
    let cookie = req.cookies;
    if (!cookie || cookie.length === 0) {
      return res.status(400).send("No cookies found. Please Login!!!");
    }
    const decoded = jwtAction.verifyToken(cookie.jwt);
    if (!decoded) {
      return res.status(400).send("Invalid cookie. Please Login!!!");
    }
    const faculty = await Faculty.findById(decoded.faculty_id);
    if (!faculty) {
      throw new Error("Faculty not found, please check faculty_id");
    }
    const contribution = await Contributions.find({
      faculty_id: faculty._id,
      status: 0,
    });
    if (!contribution) {
      throw new Error("Contribution not found (find by faculty_id)");
    }
    const contributionsFiltered = contribution.map((contribution) => {
      return {
        topic_name: contribution.topic_name,
        name: contribution.name,
        description: contribution.description,
        document: contribution.document,
      };
    });
    return res.status(200).json({
      EM: "success",
      EC: 0,
      DT: contributionsFiltered,
    });
  } catch (error) {
    console.log("Error get contribution by  --: " + error);
    res.status(500).json({ error: error.message });
  }
};

// download a contribution from server
const downloadContribution = async (req, res) => {
  try {
    const contribution = await Contribution.findById(req.params.id);

    if (!contribution) {
      return res.status(404).json({ message: "Contribution not found" });
    }
    const files = contribution.document;
    const foundFiles = [];
    const notFoundFiles = [];
    // Check if each file exists, if not, add it to notFoundFiles
    for (const file of files) {
      try {
        await fs.access(file); // Check if the file exists
        foundFiles.push({ path: file, name: path.basename(file) });
      } catch (error) {
        notFoundFiles.push(path.basename(file));
      }
    }
    if (foundFiles.length === 0) {
      return res.status(404).json({ message: "No valid files found" });
    }
    if (notFoundFiles.length > 0) {
      console.log("Files not found:", notFoundFiles);
    }
    res.zip(foundFiles);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal server error" });
  }
};

const delContribution = async (req, res) => {
  try {
    const contributionId = req.params.id;
    const contribution = await Contributions.findById(contributionId);
    if (!contribution) {
      return res.status(404).json({ message: "Contribution not found" });
    }
    for (const file of contribution.document) {
      try {
        await fs.unlink(file);
        console.log(`File ${file} has been deleted`);
      } catch (error) {
        console.error(`Error deleting file ${file}: ${error}`);
      }
    }
    await Comments.deleteMany({ contribution_id: contributionId });
    await Contributions.findByIdAndDelete(contributionId);

    console.log("Contribution deleted successfully");
    return res
      .status(200)
      .json({ message: "Contribution deleted successfully" });
  } catch (error) {
    console.log("Error deleting contribution: " + error);
    return res.status(500).json({ error: error.message });
  }
};

const setStatus = async (req, res) => {
  try {
    const contributionId = req.body.contribution_id;
    if (!contributionId) {
      return res.status(404).json({
        EM: "contribution_id not found or null",
        EC: 1,
      });
    }
    const contribution = await Contributions.findById(contributionId);
    if (!contribution) {
      return res.status(404).json({
        EM: "Contribution not found",
        EC: 1,
      });
    }
    const status = req.body.status;
    console.log(status);
    if (status !== undefined && (status == -1 || status == 0 || status == 1)) {
      contribution.status = status;
      await contribution.save();
    } else {
      return res.status(400).json({
        EM: "Invalid status value, Status must have value: -1, 0, or 1",
        EC: 1,
      });
    }

    return res.status(200).json({
      EM: "Set status successfully",
      EC: 0,
      DT: contribution,
    });
  } catch (error) {
    console.log(">>> Error status (controller): " + error);
    res.status(500).json({
      EM: "Error to set status: ",
      EC: 1,
      DT: error.message,
    });
  }
};

module.exports = {
  createContribution,
  getAllContribution,
  downloadContribution,
  showcontributionbyFaculty,
  delContribution,
  showcontributionForGuest,
  showcontributionForStudent,
  setStatus,
};
