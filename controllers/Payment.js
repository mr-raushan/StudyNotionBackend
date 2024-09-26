const { instance } = require("../config/razorpay");
const User = require("../models/User");
const Course = require("../models/Course");
const MailSender = require("../utils/mailSender");
const { default: orders } = require("razorpay/dist/types/orders");
const mailSender = require("../utils/mailSender");

//capture the payment and initiate the razorpay order
exports.capturePayment = async (req, res) => {
  //get courseId, and userId
  const { course_id } = req.body;
  const userId = req.body.id;
  //validation
  //valid courseId
  if (!course_id) {
    return res.status(401).json({
      success: false,
      message: "Course id is required",
    });
  }
  //valid courseDetail
  let course;
  try {
    course = await Course.findById(course_id);
    if (!course) {
      return res.status(401).json({
        success: false,
        message: "Course not found",
      });
    }
    //user alreday pay for the same course
    const uid = new mongoose.Types.ObjectId(userId);
    if (course.studentEnrolled.includes(uid)) {
      return res.status(200).json({
        success: false,
        message: "User alreday pay for the same course",
      });
    }
  } catch (error) {
    console.error(error);
    return res.statud(500).json({
      success: false,
      message: error.message,
    });
  }

  //order create
  const amount = course.price;
  const currency = "INR";

  const options = {
    amount: amount * 100,
    currency,
    receipt: Math.random(Date.now()).toString(),
    notes: {
      courseId: course_id,
      userId,
    },
  };

  try {
    //intiate the payment using razorpay
    const paymentResponse = await instance.orders.create(options);
    console.log(paymentResponse);

    //return response
    return res.status(200).json({
      success: true,
      courseName: course.courseName,
      courseDescription: course.courseDescription,
      thumbnail: course.thumbnail,
      orderId: paymentResponse.id,
      currency: paymentResponse.currency,
      amount: paymentResponse.amount,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      success: false,
      message: "Could not initiate transaction",
    });
  }
};

//verify signature of Razorpay and server
exports.verifySignature = async (req, res) => {
  const webhooks = "12345678";

  const signature = req.headers["x-razorpay-signature"];

  const shashum = crypto.createHmac("sha256", webhooks);
  shashum.update(JSON.stringify(req.body));
  const digest = shashum.digest("hex");

  if (signature === digest) {
    console.log("Payment is Authorized");

    const { courseId, userId } = req.body.payload.payment.entity.notes;

    try {
      //fullfil the action

      //find the course and enroll the student in it
      const enrolledCourse = await Course.findByIdAndUpdate(
        { _id: courseId },
        {
          $push: {
            studentEnrolled: userId,
          },
        },
        { new: true }
      );

      if (!enrolledCourse) {
        return res.status(401).json({
          success: false,
          message: "Course not found",
        });
      }

      console.log(enrolledCourse);

      //find the student added the course to their list of enrolled courses me
      const enrolledStudent = await User.findByIdAndUpdate(
        { _id: userId },
        {
          $push: {
            courses: courseId,
          },
        },
        { new: true }
      );

      console.log(enrolledStudent);

      //mail send krdo confirmation wala
      const emailResponse = await mailSender(
        enrolledStudent.email,
        "Congratulation from CodeHelp",
        "Congratulation, you are onboarded into new CodeHelp Course!"
      );
      console.log(emailResponse);

      return res.status(200).json({
        success: true,
        message: "Payment is successful and course enrolled",
      });
    } catch (error) {
      console.error(error);
      return res.status(500).json({
        success: false,
        message: "Payment verification failed",
      });
    }
  } else {
    return res.status(400).json({
      success: false,
      message: "Payment signature verification failed",
    });
  }
};
