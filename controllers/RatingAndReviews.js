const RatingAndReview = require("../models/RatingAndReview");
const Course = require("../models/Course");
const { Mongoose } = require("mongoose");

//create ratring

exports.createRating = async (req, res) => {
  try {
    //get user id
    const userId = req.user.id;

    //fetch data from req body
    const { rating, review, courseId } = req.body;

    //check if user already enrolled or not
    const courseDetails = await Course.findOne({
      _id: courseId,
      studentEnrolled: { $elemMatch: { $eq: userId } },
    });

    if (!courseDetails) {
      return res.status(404).json({
        success: false,
        message: "User not enrolled in this course",
      });
    }

    //check if user already reviewed or not
    const alreadyReviewed = await RatingAndReview.findOne({
      user: userId,
      course: courseId,
    });
    if (alreadyReviewed) {
      return res.status(403).json({
        success: false,
        message: "User already reviewed this course",
      });
    }
    //create rating and review
    const ratingReview = await RatingAndReview.create({
      rating: rating,
      review: review,
      user: userId,
      course: courseId,
    });

    console.log(ratingReview);

    //update course with this rating / reveiw
    const updatedCourseDetails = await Course.findByIdAndUpdate(
      { _id: courseId },
      {
        $push: {
          ratingAndReviews: ratingReview._id,
        },
      },
      { new: true }
    );
    console.log(updatedCourseDetails);

    //return response
    return res.status(200).json({
      success: true,
      message: "Rating and review created Successfully!",
      ratingReview,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      success: false,
      message: "Failed to create rating, please try again",
    });
  }
};

//getAverageRating

exports.getAverageRating = async (req, res) => {
  try {
    //get course id
    const courseId = req.body.courseId;

    //calculate average rating
    const result = await RatingAndReview.aggregate([
      {
        $match: {
          course: new Mongoose.Types.Objectd(courseId),
        },
      },
      {
        $group: {
          _id: null,
          averageRating: { $avg: "rating" },
        },
      },
    ]);

    //return rating
    if (result.length > 0) {
      return res.status(200).json({
        success: true,
        message: "Average rating retrieved successfully!",
        averageRating: result[0].averageRating,
      });
    }

    //if not review/rating exist
    return res.status(200).json({
      success: true,
      message: "Average rating is 0, no ratings given till now!",
      averageRating: 0,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      success: false,
      message: "Failed to retrieve average rating, please try again",
    });
  }
};

//getAllRatingAndReview

exports.getAllRatingAndReview = async (req, res) => {
  try {
    const allReviews = await RatingAndReview.find({})
      .sort({ rating: "desc" })
      .populate({
        path: "user",
        select: "firstName, lastName, email, image",
      })
      .populate({
        path: "course",
        select: "courseName",
      })
      .exec();

    //return response
    return res.status(200).json({
      success: true,
      message: "All Rating and Reviews retrieved successfully!",
      allReviews,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      success: false,
      message: "Failed to retrieve all rating, please try again",
    });
  }
};
