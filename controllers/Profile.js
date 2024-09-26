const Profile = require("../models/Profile");
const User = require("../models/User");

exports.updateProfile = async (req, res) => {
  try {
    //fetch data
    const { dateOfBirth = "", about = "", contactNumber, gender } = req.body;
    //get userId
    const id = req.user.id;
    //validation
    if (!contactNumber || !gender || !id) {
      return res.status(401).json({
        success: false,
        message: "All fields are required",
      });
    }
    //find profile
    const userDetails = await User.findById(id);
    const profileId = userDetails.additionalDetails;
    const profileDetails = await Profile.findById(profileId);

    //update profile
    (profileDetails.dateOfBirth = dateOfBirth),
      (profileDetails.about = about),
      (profileDetails.contactNumber = contactNumber),
      (profileDetails.gender = gender);
    await profileDetails.save();
    //return res

    return res.status(200).json({
      success: true,
      message: "Profile updated successfully",
      data: profileDetails,
    });
  } catch (error) {
    console.log(error);
    return res.status(400).json({
      success: false,
      message: "Failed to update profile, please try again",
    });
  }
};

//delete account
//EXPLORE: how can we schedule this deletion operation
exports.deleteAccount = async (req, res) => {
  try {
    // get id
    const id = req.user.id;
    //validation
    const userDetails = await User.findById(id);
    if (!userDetails) {
      return res.status(401).json({
        success: false,
        message: "User not found",
      });
    }
    //delete profile
    await Profile.findByIdAndDelete({ _id: userDetails.additionalDetails });

    //TODO: enroll user from all enrolled courses and -1 show the profile to admin

    //delete user
    await User.findByIdAndDelete({ _id: id });

    //return res
    return res.status(200).json({
      success: true,
      message: "Account deleted successfully",
    });
  } catch (error) {
    console.log(error);
    return res.status(400).json({
      success: false,
      message: "Failed to delete account, please try again",
    });
  }
};

exports.getAllUserDetails = async (req, res) => {
  try {
    const id = req.user.id;
    const userDetails = await User.findById(id)
      .populate("additionalDetails")
      .exec();

    return res.status(200).json({
      success: true,
      message: "User details retrieved successfully",
      data: userDetails,
    });
  } catch (error) {
    console.log(error);
    return res.status(400).json({
      success: false,
      message: "Failed to retrieve user details, please try again",
    });
  }
};
