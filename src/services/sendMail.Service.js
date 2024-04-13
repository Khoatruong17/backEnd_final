const nodemailer = require("nodemailer");
require("dotenv").config();

const sendEmail = async (email, htmlBody) => {
  const transporter = nodemailer.createTransport({
    host: "smtp.gmail.com",
    port: 587,
    secure: false, // Use `true` for port 465, `false` for all other ports
    auth: {
      user: process.env.EMAIL_USERNAME,
      pass: process.env.EMAIL_PASSWORD,
    },
  });

  const info = await transporter.sendMail({
    from: '"Manager System " <truongndkgch190486@fpt.edu.vn>', // sender address
    to: email, // list of receivers
    subject: "Have a student upload file", // Subject line
    text: htmlBody, // plain text body
    //html: htmlBody, // html body
  });
  console.log("Message sent: %s", info.messageId);
  return {
    EM: "Success",
    EC: 0,
    DT: {
      message: "Email sent successfully",
      info: info,
    },
  };
};

module.exports = {
  sendEmail,
};
