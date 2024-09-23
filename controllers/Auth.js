const User = require("../models/User");
const OTP = require("../models/OTP");
const bcrypt = require("bcrypt");
const Profile = require("../models/Profile");
const otpGenerator = require("otp-generator");

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
        message: "User alreday exist",
      });
    }

    //generate random otp
    const otp = otpGenerator.generate(6, {
      upperCaseAlphabets: false,
      lowerCaseAlphabets: false,
      specialChars: false,
    });

    //check unique otp or not
    let result = await User.findOne({ otp: otp });
    while (result) {
      otp = otpGenerator(6, {
        upperCaseAlphabets: false,
        lowerCaseAlphabets: false,
        specialChars: false,
      });
      result = await User.findOne({ otp: otp });
    }

    const otpPayload = { email, otp };
    //create an entry for otp in DB
    const otpBody = await OTP.create(otpPayload);
    console.log(otpBody);

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

//signup
3;
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
      mobileNumber,
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
    const recentOtp = await OTP.findOne({ email })
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

    //profile details
    const profileDetails = await Profile.create({
      gender: null,
      mobileNumber: null,
      about: null,
      dateOfBirth: null,
    });

    //create entry in DB
    const user = await User.create({
      firstName,
      lastName,
      email,
      password: hashedPassword,
      accountType,
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
    const user = await User.findOne({ email });
    //error aa skta hai yaha
    if (!userExist) {
      return res.stauts(400).json({
        success: false,
        message: "User not found",
      });
    }

    //generate jwt after password matching
    if (await bcrypt.compare(password, user.password)) {
      const payload = {
        email: user.email,
        id: user._id,
        accountType: user.accountType,
      };
      const token = jwt.sign(payload, process.env.JWT_SECRET, {
        expiresIn: "24h",
      });
      console.log(token);

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
