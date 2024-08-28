const bcrypt = require("bcrypt");
const User = require("../models/userModel");

const GetallUser = async () => {
  try {
    const allUser = await User.find();
    return {
      status: 200,
      EM: "GetAllUsers successfully",
      EC: 0,
      DT: allUser,
    };
  } catch (error) {
    console.log("Error get all user: (service)" + error);
    return {
      status: 500,
      EM: "GetAllUsers Failed" + error.message,
      EC: 1,
      DT: allUser,
    };
  }
};

module.exports = {
  GetallUser,
};
