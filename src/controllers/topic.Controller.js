const TopicModel = require("../models/topicModel");
const TopService = require("../services/topic.Service");
const jwtAction = require("../middleware/jwtAction");
const facultyModel = require("../models/facultyModel");

const createTopic = async (req, res) => {
  try {
    const headers = req.headers;
    const authorizationHeader = headers.authorization;
    console.log("Authorization Header:", authorizationHeader);
    if (!authorizationHeader || authorizationHeader.length === 0) {
      return res.status(400).send("No cookies found. Please Login!!!");
    }
    const decoded = jwtAction.verifyToken(authorizationHeader);
    if (!decoded) {
      return res.status(400).send("Invalid cookie. Please Login!!!");
    }
    let data = await TopService.createNewTopic(req.body, decoded);
    return res.status(200).json({
      EM: data.EM,
      EC: data.EC,
      DT: data.DT,
    });
  } catch (error) {
    console.log(">> Create Topic Fail: ", error);
    return res.status(500).json({
      EM: "error from server (controller)", //error message
      EC: "-1", //error code
    });
  }
};

const getAllTopic = async (req, res) => {
  try {
    let data = await TopService.getAllTopic();
    return res.status(200).json({
      EM: data.EM,
      EC: data.EC,
      DT: data.DT,
    });
  } catch (error) {
    console.log(">> Get All Topic Fail: ", error);
    return res.status(500).json({
      EM: "error from server (controller)", //error message
      EC: "-1", //error code
    });
  }
};

const deletedTopic = async (req, res) => {
  try {
    const result = await TopicModel.findByIdAndDelete(req.params.id);
    if (!result) {
      return res.status(404).json({
        EM: "Topic not found",
        EC: "-1",
      });
    }
    return res.status(200).json({
      EM: "Delete success",
      EC: "0",
      DT: result,
    });
  } catch (error) {
    console.log(">> Delete Topic Fail: ", error);
    return res.status(500).json({
      EM: "error from server (controller)",
      EC: "-1",
    });
  }
};

const showTopicbyFaculty = async (req, res) => {
  try {
    const headers = req.headers;
    const authorizationHeader = headers.authorization;
    if (!authorizationHeader || authorizationHeader.length === 0) {
      return res.status(400).send("No cookies found. Please Login!!!");
    }
    const decoded = jwtAction.verifyToken(authorizationHeader);
    if (!decoded) {
      return res.status(400).send("Invalid cookie. Please Login!!!");
    }

    const faculty_id = decoded.faculty_id;
    const faculty = await facultyModel.findById(faculty_id);
    console.log(">>> Check Khoa: ", faculty);
    console.log(">>> Check Khoa: ", faculty._id);
    if (!faculty) {
      throw new Error("Faculty not found, please check faculty_id");
    }

    const topic = await TopicModel.find({
      faculty_id: faculty._id,
    });
    console.log(">>> Check Topic : ", topic);
    return res.status(200).json({
      EM: "get Topic by Faculty success",
      EC: "0",
      DT: topic,
    });
  } catch (error) {
    console.log(">> get Topic by Faculty fail: ", error);
    return res.status(500).json({
      EM: "get Topic by Faculty fail",
      EC: "-1",
    });
  }
};

module.exports = {
  createTopic,
  getAllTopic,
  deletedTopic,
  showTopicbyFaculty,
};
