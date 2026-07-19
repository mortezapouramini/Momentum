const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: process.env.SMTP_PORT,
  secure: false,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

const sendMail = async (to, subject, text) => {
  try {
    await transporter.sendMail({
      from: "Momentum",
      sender: "Momentum",
      to,
      subject,
      text,
    });
    return true;
  } catch (error) {
    throw error;
  }
};

module.exports = { sendMail };
