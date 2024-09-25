const SubSection = require("../models/SubSection");
const Section = require("../models/Section");
const { uploadImageToCloudinary } = require("../utils/imageUploader");

//create subSection
exports.subSection = async (req, res) => {
  try {
    //fetch data
    const { sectionId, title, description, timeDuration } = req.body;
    //extract file/video
    const video = req.files.videoFile;
    //data validation
    if (!sectionId || !title || !description || !timeDuration || !video) {
      return res.status(401).json({
        success: false,
        message: "All fields are required",
      });
    }
    //upload video to cloudinary
    const uploadDetails = await uploadImageToCloudinary(
      video,
      process.env.FOLDER_NAME
    );
    //create subSection
    const subSectionDetails = await SubSection.create({
      title: title,
      description: description,
      timeDuration: timeDuration,
      videoUrl: uploadDetails.secure_url,
      thumbnailUrl: uploadDetails.thumbnail_url,
    });
    //update section with this subSection ObjectId
    const updatedSection = await Section.findByIdAndUpdate(
      { _id: sectionId },
      {
        $push: {
          subSection: subSectionDetails._id,
        },
      },
      { new: true }
    );
    //HW: log updatedSection here, after adding populate query
    //return response
    return res.status(200).json({
      success: true,
      message: "Subsection created successfully",
      data: updatedSection,
    });
  } catch (error) {
    console.log(error);
    return res.status(400).json({
      success: false,
      message: "Failed to create subsection, please try again",
    });
  }
};

// TODO: Add update sub-section
exports.updateSubSection = async (req, res) => {
  try {
    //fetch data
    //data validation
    //update subsection
    //return response
  } catch (error) {
    console.log(error);
    return res.status(400).json({
      success: false,
      message: "Failed to update subsection, please try again",
    });
  }
};

// TODO: Add delete sub-section

exports.deleteSubSection = async (req, res) => {
  try {
    //fetch  data
    //data validation
    //delete subsection from section
    //update section
    //return response
  } catch (error) {
    console.log(error);
    return res.status(400).json({
      success: false,
      message: "Failed to delete subsection, please try again",
    });
  }
};
