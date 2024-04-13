const { model } = require("mongoose");
const sendEmailMessage = require("../services/sendMail.Service");
const User = require("../models/userModel");
const Group = require("../models/groupModel");

const sendMail = async (req, res) => {
  try {
    const { email } = req.body;
    if (email) {
      const data = await sendEmailMessage.sendEmail(email);
      return res.status(200).json({
        EM: data.EM,
        EC: data.EC,
        DT: data.DT,
      });
    }
    return {
      EM: "sendMailtoAdmin error (Controller): Email is required",
      EC: 1,
      DT: error,
    };
  } catch (error) {
    return {
      EM: "sendMailtoAdmin error (Controller)",
      EC: 1,
      DT: error,
    };
  }
};

module.exports = {
  sendMail,
};
