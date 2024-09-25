const SubSection = require("../models/SubSection");
const Section = require("../models/Section");

//create subSection
exports.subSection = async (req, res) => {
  try {
    //fetch data
    //data validation
    //create subSection
  } catch (error) {
    console.log(error);
    return res.status(400).json({
      success: false,
      message: "Failed to create subsection, please try again",
    });
  }
};
