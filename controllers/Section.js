const Section = require("../models/Section");
const Course = require("../models/Course");
const { findByIdAndDelete } = require("../models/User");

//create section
exports.createSection = async (req, res) => {
  try {
    //fetch data
    const { sectionName, courseId } = req.body;
    //data validation
    if (!sectionName || !courseId) {
      return res.status(400).json({
        success: false,
        message: "All fields are required",
      });
    }
    //create section
    const newSection = await Section.create({ sectionName });
    //update course with section ObjectID
    const updateCourseDetails = await Course.findByIdAndUpdate(
      courseId,
      {
        $push: {
          courseContent: newSection._id,
        },
      },
      { new: true }
    ); //HW: use populate to replace section/subSection both in the updateCourseDetails

    return res.status(200).json({
      success: true,
      message: "Section created successfully",
      data: updateCourseDetails,
    });
  } catch (error) {
    console.log(error);
    return res.status(400).json({
      success: false,
      message: "Failed to create a new section",
    });
  }
};

//update section
exports.updateSection = async (req, res) => {
  try {
    //fetch data
    const { sectionName, sectionId } = req.body;
    //data validation
    if (!sectionName || !sectionId) {
      return res.status(400).json({
        success: false,
        message: "All fields are required",
      });
    }
    //update section
    const updatedSection = await Section.findByIdAndUpdate(
      sectionId,
      { sectionName },
      { new: true }
    );
    //return response
    return res.status(200).json({
      success: true,
      message: "Section updated successfully",
      data: updatedSection,
    });
  } catch (error) {
    console.log(error);
    return res.status(400).json({
      success: false,
      message: "Failed to update section",
    });
  }
};

//delete section
exports.deleteSection = async (req, res) => {
  try {
    // fetch id
    //agar section delete krte time error aaye tb
    // req.params
    // krke ek try krna
    const { sectionId } = req.body;
    // validate id
    if (!sectionId) {
      return res.status(401).json({
        success: false,
        message: "Section id is required",
      });
    }
    //delete section
    await Section.findByIdAndDelete(sectionId);
    //TODO[testing]: do we need to delete the entry from the course Schema ??
    //return res
    return res.status(200).json({
      success: true,
      message: "Section deleted successfully",
    });
  } catch (error) {
    console.log(error);
    return res.status(400).json({
      success: false,
      message: "Failed to delete section",
    });
  }
};
