const mongoose = require("mongoose");
const mailSender = require("../utils/mailSender");

//is code me changes krne hai

const OTPSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
  },
  otp: {
    type: String,
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now(),
    expires: 5 * 60,
  },
});

//a function -> to send email
async function sendVerificationEmail(email, otp) {
  try {
    const mailResponse = await mailSender(
      email,
      "Verification email from StudyNotion",
      otp
    );
    console.log("Email sent successfully :", mailResponse);
  } catch (error) {
    console.log("error occured while sending verification email", error);
    throw error;
  }
}

//pre middleware
OTPSchema.pre("save", async function (next) {
  await sendVerificationEmail(this.email, this.otp);
  next();
});

module.exports = mongoose.model("OTP", OTPSchema);
