const User = require("../models/User");
const OTP = require("../models/OTP");
const bcrypt = require("bcrypt");
const Profile = require("../models/Profile");
const otpGenerator = require("otp-generator");
const mailSender = require("../utils/mailSender");
const { passwordUpdated } = require("../mail/templates/passwordUpdate");
require("dotenv").config();
const jwt = require("jsonwebtoken");

//signup
exports.signUp = async (req, res) => {
  try {
    //fetch data from request ki body
    const {
      firstName,
      lastName,
      email,
      password,
      otp,
      confirmPassword,
      contactNumber,
      accountType,
    } = req.body;

    //validate data
    if (
      !firstName ||
      !lastName ||
      !email ||
      !password ||
      !otp ||
      !confirmPassword
    ) {
      return res.status(403).json({
        success: false,
        message: "All field are required!",
      });
    }

    //2 password match krlo
    if (password !== confirmPassword) {
      return res.status(400).json({
        success: false,
        message:
          "Password and Confirm Password are not match, please try again",
      });
    }

    //check if user is already registered
    const userExist = await User.findOne({ email });
    if (userExist) {
      return res.status(400).json({
        success: false,
        message: "Email already registered, please try with another email",
      });
    }

    //find most recent otp stored for the user
    const recentOtp = await OTP.find({ email })
      .sort({ createdAt: -1 })
      .limit(1);
    console.log(recentOtp);

    //validate otp
    if (recentOtp.length == 0) {
      //otp not found
      return res.stauts(400).json({
        success: false,
        message: "Otp not found",
      });
    } else if (otp !== recentOtp.otp) {
      //invalid otp
      return res.status(400).json({
        success: false,
        message: "Invalid OTP",
      });
    }

    //hash password

    const hashedPassword = await bcrypt.hash(password, 10);

    //create the user
    let approved = "";
    approved === "Instructor" ? (approved = false) : (approved = true);

    //profile details
    const profileDetails = await Profile.create({
      gender: null,
      contactNumber: null,
      about: null,
      dateOfBirth: null,
    });

    //create entry in DB
    const user = await User.create({
      firstName,
      lastName,
      email,
      contactNumber,
      password: hashedPassword,
      accountType: accountType,
      approved: approved,
      additionalDetails: profileDetails._id,
      image: `https://api.dicebear.com/5.x/initials/svg?seed=${firstName} ${lastName}`,
    });

    //return successful response
    return res.status(200).json({
      success: true,
      message: "User registered successfully!!",
      user,
    });
  } catch (error) {
    console.log(error);
    return res.status(400).json({
      success: false,
      message: "User cannot be registered, please try again",
    });
  }
};

//login

exports.login = async (req, res) => {
  try {
    //fetch data from request ki body
    const { email, password } = req.body;

    //validate data
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: "All field are required",
      });
    }

    //check if user is registered or not
    const user = await User.findOne({ email }).populate("additionalDetails");
    //error aa skta hai yaha
    if (!user) {
      return res.stauts(400).json({
        success: false,
        message: `User is not registered with Us Please SignUp to Continue`,
      });
    }

    //generate jwt after password matching
    if (await bcrypt.compare(password, user.password)) {
      const token = jwt.sign(
        { email: user.email, id: user._id, accountType: user.accountType },
        process.env.JWT_SECRET,
        {
          expiresIn: "24h",
        }
      );
      // const payload = {
      //   email: user.email,
      //   id: user._id,
      //   accountType: user.accountType,
      // };
      // const token = jwt.sign(payload, process.env.JWT_SECRET, {
      //   expiresIn: "24h",
      // });
      // console.log(token);

      //save the token to user document in database
      user.token = token;
      user.password = undefined;

      //create cookies
      const options = {
        expires: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000),
        httpOnly: true,
      };

      res.cookie("token", token, options).stauts(200).json({
        success: true,
        message: "User logged in successfully!",
        user,
        token,
      });
    } else {
      return res.status(401).json({
        success: false,
        message: "Password in incorrect",
      });
    }
  } catch (error) {
    console.log(error);
    return res.stauts(400).json({
      success: false,
      message: "User cannot be logged in, please try again",
    });
  }
};

//SendOtp
exports.sendOtp = async (req, res) => {
  try {
    //get email from request ki body
    const { email } = req.body;
    //check if user already exist
    const checkUserPresent = await User.findOne({ email });
    if (checkUserPresent) {
      return res.status(400).json({
        success: false,
        message: `User is Already Registered`,
      });
    }

    //generate random otp
    var otp = otpGenerator.generate(6, {
      upperCaseAlphabets: false,
      lowerCaseAlphabets: false,
      specialChars: false,
    });

    //check unique otp or not
    const result = await OTP.findOne({ otp: otp });
    console.log("Result in Generate OPT func");
    console.log("OTP", otp);
    console.log("Result", result);

    while (result) {
      otp = otpGenerator.generate(6, {
        upperCaseAlphabets: false,
      });
      // result = await User.findOne({ otp: otp });
    }

    const otpPayload = { email, otp };
    //create an entry for otp in DB
    const otpBody = await OTP.create(otpPayload);
    console.log("OTP Body ", otpBody);

    //return successfull response
    res.status(200).json({
      success: true,
      message: "OTP sent successfully!",
      otp,
    });
  } catch (error) {
    console.log(error);
    return res.status(404).json({
      success: false,
      message: "Failed to send OTP, please try again",
    });
  }
};

//change password
//ai generated code
exports.changePassword = async (req, res) => {
  try {
    //get user data from req.user
    const userDetails = await User.findById(req.user.id);

    //get old password, new password, and confirm new password from req.body
    const { oldPassword, newPassword, confirmNewPassword } = req.body;

    //validate old password
    const isPasswordMatch = await bcrypt.compare(
      oldPassword,
      userDetails.password
    );
    if (!isPasswordMatch) {
      return res.status(401).json({
        success: false,
        message: "The password is incorrect",
      });
    }

    //match new password and confirm new password
    if (newPassword !== confirmNewPassword) {
      return res.status(400).json({
        success: false,
        message: "The password and confirm password does not match",
      });
    }

    //update password
    const encryptedPassword = await bcrypt.hash(newPassword, 10);
    const updatedUserDetails = await User.findByIdAndUpdate(
      req.user.id,
      { password: encryptedPassword },
      { new: true }
    );
    console.log("Updated User Details: ", updatedUserDetails);

    //send notification email
    try {
      const emailResponse = await mailSender(
        updatedUserDetails.email,
        passwordUpdated(
          updatedUserDetails.email,
          `Password updated successfully for ${updatedUserDetails.firstName}
          ${updatedUserDetails.lastName}`
        )
      );
      console.log("Email sent successfully:", emailResponse.response);
    } catch (error) {
      console.log("Error occured while sending email", error);
      return res.status(500).json({
        success: false,
        message: "Error occured while sending email",
        error: error.message,
      });
    }
    //return success response
    return res.status(200).json({
      success: true,
      message: `Password Updated successfully for ${updatedUserDetails}.`,
    });
  } catch (error) {
    console.log("Error occured while updating password", error);
    return res.status(500).json({
      success: false,
      message: "Error while updating password",
      error: error.message,
    });
  }
};
