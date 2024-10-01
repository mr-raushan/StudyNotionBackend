const express = require("express");
const router = express.Router();

//import the required controller and middleware function
const {
  login,
  signUp,
  sendOtp,
  changePassword,
} = require("../controllers/Auth.js");

const {
  resetPassword,
  resetPasswordToken,
} = require("../controllers/ResetPassword.js");

const { auth } = require("../middleware/auth.js");

// Routes for login and signUp Authentication

// ****************************************************************
//                  Authentication Routes
// ****************************************************************

//Route for user login
router.post("/login", login);

//Route for user signup
router.post("/signup", signUp);

//Route for sending OTP
router.post("/sendOtp", sendOtp);

//Route for changing password
router.post("/changePassword", changePassword);

// ****************************************************************
//                    Reset Password
// ****************************************************************

//route for generating a reset password token
router.post("/resetPassordToken", resetPasswordToken);

//route for resetting user's password after verification
router.post("/resetPassword", resetPassword);

module.exports = router;
