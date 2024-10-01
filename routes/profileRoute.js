const express = require("express");
const router = express.Router();

const { auth } = require("../middleware/auth");

const {
  deleteAccount,
  updateProfile,
  getAllUserDetails,
  getEnrolledCourses,
  updateDisplayPicture,
} = require("../controllers/Profile");

// ****************************************************************
//               Profile Routes
// ****************************************************************

//delete user account
router.delete("/delete", auth, deleteAccount);

router.put("/updateProfile", updateProfile);

router.get("/getAllUserDetails", getAllUserDetails);

//get enrolled courses
router.get("/getEnrolledCourses", getEnrolledCourses);
router.put("/updateDisplayPicture", updateDisplayPicture);

module.exports = router;
