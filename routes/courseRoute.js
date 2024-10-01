const express = require("express");
const router = express.Router();

//course controller
const {
  createCourse,
  getCourseDetails,
  showAllCourse,
} = require("../controllers/Course");

//category controller
const {
  showAllCategory,
  createCategory,
  categoryPageDetails,
} = require("../controllers/Category");

//section controller
const {
  createSection,
  updateSection,
  deleteSection,
} = require("../controllers/Section");

//subSection controller
const {
  updateSubSection,
  deleteSubSection,
  subSection,
} = require("../controllers/SubSection");

//rating controller
const {
  createRating,
  getAverageRating,
  getAllRatingAndReview,
} = require("../controllers/RatingAndReviews");

//import middleware
const {
  auth,
  isInstructor,
  isAdmin,
  isStudent,
} = require("../middleware/auth");

// ****************************************************************
//                  Course Routes
// ****************************************************************

//course can Only be created by Instructors
router.post("/createCourse", auth, isInstructor, createCourse);

//add a section to a course
router.post("/addSection", auth, isInstructor, createSection);

//update a section in a course
router.post("/updateSection", auth, isInstructor, updateSection);

//delete a section
router.post("/deleteSection", auth, isInstructor, deleteSection);

//Edit subSection
router.post("/updateSubSection", auth, isInstructor, updateSubSection);

//delete subSection
router.post("/deleteSubSection", auth, isInstructor, deleteSubSection);

//add a sub section to a section
router.post("/addSubSection", auth, isInstructor, subSection);

//get all registered courses
router.get("/getAllCourses", showAllCourse);

//get details for a specific courses
router.post("/getCourseDetails", getCourseDetails);

// ****************************************************************
//              Category Routes (Only by Admin)
// ****************************************************************

//category can only created by Admin
router.post("/createCategory", auth, isAdmin, createCategory);

router.get("/showAllCategories", showAllCategory);

router.post("/getCategoryPageDetails", categoryPageDetails);

// ****************************************************************
//                     Rating And Review
// ****************************************************************

router.post("/creatRating", auth, isStudent, createRating);
router.get("/getAverageRating", getAverageRating);
router.get("/getReviews", getAllRatingAndReview);

module.exports = router;
