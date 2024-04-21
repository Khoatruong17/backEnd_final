const TopicModel = require("../models/topicModel");
const jwtAction = require("../middleware/jwtAction");
const moment = require("moment-timezone");

// Function to check if end date is greater than start date
const isValidDateRange = (startDate, endDate) => {
  return new Date(endDate) > new Date(startDate);
};
// Function to check if start date is greater than today
const isValidStartDate = (startDate) => {
  const currentDate = new Date(); // get current date
  const inputDate = new Date(startDate); // change start date to date format

  if (inputDate < currentDate) {
    return false;
  }

  return true;
};

const checkName = async (topicName) => {
  const nameExists = await TopicModel.findOne({ name: topicName });
  if (nameExists) {
    return true;
  }
  return false;
};

const createNewTopic = async (requestData, decoded) => {
  try {
    const user_id = decoded.id;
    console.log(user_id);

    // check start-date
    if (!isValidStartDate(requestData.start_date)) {
      console.log(requestData.start_date);
      console.log("Start date must be greater than or equal to today's date ");
      return {
        EM: "Start date must be greater than or equal to today's date",
        EC: "1",
      };
    }

    // check end-date
    if (!isValidDateRange(requestData.start_date, requestData.end_date)) {
      // Access requestData instead of req.body
      console.log(requestData.start_date);
      console.log("End date must be greater than start date ");
      return {
        EM: "End date must be greater than start date",
        EC: "1",
      };
    }

    // check topic name
    if (await checkName(requestData.name)) {
      console.log("Topic name already exists: " + requestData.name);
      return {
        EM: "Topic name already exists",
        EC: "1",
      };
    }

    const newTopic = new TopicModel({
      name: requestData.name,
      description: requestData.description,
      start_date: requestData.start_date,
      end_date: requestData.end_date,
      user_id: user_id,
      faculty_id: requestData.faculty_id,
    });
    const savedTopic = await newTopic.save();
    return {
      EM: "Success",
      EC: "0",
      DT: savedTopic,
    };
  } catch (error) {
    console.error(">>> Error createNewTopic (se)", error);
    return {
      EM: "Error",
      EC: "1",
      DT: JSON.stringify(error),
    };
  }
};

const getAllTopic = async () => {
  try {
    const allUser = await TopicModel.find();
    return {
      EM: "Get All Topic successfully",
      EC: 0,
      DT: allUser,
    };
  } catch (error) {
    console.log("Get All Topic error: (service)" + error);
    return {
      EM: "Get All Topic Failed",
      EC: 1,
      DT: JSON.stringify(error),
    };
  }
};

module.exports = {
  createNewTopic,
  getAllTopic,
};
