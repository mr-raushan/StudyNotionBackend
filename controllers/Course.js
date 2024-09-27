const Course = require("../models/Course");
const Category = require("../models/category");
const User = require("../models/User");
const { uploadImageToCloudinary } = require("../utils/imageUploader");

//createCourse handler function
exports.createCourse = async (req, res) => {
  try {
    //get data from request body
    const { courseName, courseDescription, whatYouWillLearn, price, category } =
      req.body;

    //get thumbnail
    const thumbnail = req.files.thumbnaiImage;

    //validate data
    if (
      !courseName ||
      !courseDescription ||
      !whatYouWillLearn ||
      !thumbnail ||
      !price ||
      !category
    ) {
      return res.status(400).json({
        success: false,
        message: "All field are required",
      });
    }

    //check for instructor
    const userId = req.user.id;
    const instructorDetails = await User.findById(userId);
    console.log("instructor details => ", instructorDetails);

    if (!instructorDetails) {
      return res.status(404).json({
        success: false,
        message: "Instructor detail not found",
      });
    }

    //category validation
    const categoryDetails = await Category.findById(category);
    if (!categoryDetails) {
      return res.status(400).json({
        success: false,
        message: "Category not found",
      });
    }

    //image upload on cloudinary
    const thumbnaiImage = await uploadImageToCloudinary(
      thumbnail,
      process.env.FOLDER_NAME
    );

    //create course entry in DB
    const newCourse = await Course.create({
      courseName,
      courseDescription,
      instructor: instructorDetails._id,
      whatYouWillLearn: whatYouWillLearn,
      price,
      thumbnaiImage: thumbnaiImage.secure_url,
      category: [categoryDetails._id], //add categroy to course
    });

    //add the new course to the user schema of instructor
    await User.findByIdAndUpdate(
      { _id: instructorDetails._id },
      {
        $push: {
          courses: newCourse._id,
        },
      },
      { new: true }
    );

    //update the category schema
    // TODO: HW

    //return successful response
    return res.status(200).json({
      success: true,
      message: "Course updated successfully",
      data: newCourse,
    });
  } catch (error) {
    console.log(error);
    return res.status(400).json({
      success: false,
      message: "Failed to create course, please try again",
    });
  }
};

//getAllCourse handler function

exports.showAllCourse = async (req, res) => {
  try {
    const allCourses = await Course.find(
      {},
      {
        courseName: true,
        thumbnail: true,
        price: true,
        instructor: true,
        ratingAndReviews: true,
        studentEnrolled: true,
      }
    )
      .populate("instructor")
      .exec();

    return res.status(200).json({
      success: true,
      message: "All courses retrieved successfully",
      data: allCourses,
    });
  } catch (error) {
    console.log(error);
    return res.status(400).json({
      success: false,
      message: "Failed to retrieve all courses, please try again",
    });
  }
};

//getCourseDetails

exports.getCourseDetails = async (req, res) => {
  try {
    //get id
    const { courseId } = req.body;

    //find course details
    const courseDetails = await Course.findById({ _id: courseId })
      .populate({
        path: "instructor",
        populate: {
          path: "additionalDetails",
        },
      })
      .populate("category")
      .populate("ratingAndReviews")
      .populate({
        path: "courseContent",
        populate: {
          path: "subSection",
        },
      })
      .exec();

    //validation
    if (!courseDetails) {
      return res.status(400).json({
        success: false,
        message: `Could not find the course with ${courseId}`,
      });
    }

    return res.status(200).json({
      success: true,
      message: "Course details retrieved successfully",
      data: courseDetails,
    });
  } catch (error) {
    console.log(error);
    return res.status(400).json({
      success: false,
      message: "Failed to retrieve course details, please try again",
    });
  }
};
