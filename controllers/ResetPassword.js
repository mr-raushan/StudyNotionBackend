const User = require("../models/User");
const mailSender = require("../utils/mailSender");
const bcrypt = require("bcrypt");
const crypto = require("crypto");

//resetPasswordToken
exports.resetPasswordToken = async (req, res) => {
  try {
    //get email from req ki body
    const { email } = req.body.email;

    //check user for this email, email validation'
    const user = await User.findOne({ email: email });
    if (!user) {
      return res.status(400).json({
        success: false,
        message: "Your email is not registered with us",
      });
    }
    //generate token
    const token = crypto.randomUUID();

    //update user by adding token and expiration time
    const updateDetails = await User.findOneAndUpdate(
      { email: email },
      {
        token: token,
        resetPasswordExpires: Date.now() + 5 * 60 * 1000,
      },
      {
        new: true,
      }
    );
    console.log(updateDetails);

    //create url
    const url = `https://localhost:5172/update-password/${token}`;
    //send mail containing the url
    await mailSender(
      email,
      "Password Reset Link",
      `Password Reset Link : ${url}`
    );
    //return response
    return res.status(200).json({
      success: true,
      message: "Reset Password Link has been sent to your email",
    });
  } catch (error) {
    console.log(error);
    return res.status(400).json({
      success: false,
      message: "Reset password token not found, please try again",
    });
  }
};

//resetPassword

exports.resetPassword = async (req, res) => {
  try {
    //fetch data from req ki body
    const { password, confirmPassword, token } = req.body;
    //validate data
    if (password !== confirmPassword) {
      return res.status(400).json({
        success: false,
        message:
          "Password and Confirm Password are not match, please try again",
      });
    }
    //get user details from DB using token
    const userDetails = await User.findOne({ token: token });
    //if no entry invalid token
    if (!userDetails) {
      return res.status(400).json({
        success: false,
        message: "Invalid token, please try again",
      });
    }
    //token time check
    if (userDetails.resetPasswordExpires < Date.now()) {
      return res.status(400).json({
        success: false,
        message: "Token is expired please regenerate the token again!",
      });
    }

    //hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    //update password
    await User.findOneAndUpdate(
      { token: token },
      { password: hashedPassword },
      { new: true }
    );

    //return successful response
    return res.status(200).json({
      success: true,
      message: "Password reset successful, you can now login",
    });
  } catch (error) {
    console.log(error);
    return res.status(400).json({
      success: false,
      message: "Password reset failed, please try again",
    });
  }
};
