const Categroy = require("../models/category");
const Course = require("../models/Course");

//create category ka handler

exports.createCategory = async (req, res) => {
  try {
    //fetch data
    const { name, description } = req.body;

    //validation

    if (!name || !description) {
      return res.status(401).json({
        success: false,
        message: "All fields are required",
      });
    }

    //create entry in DB
    const categoryDetails = await Categroy.create({
      name: name,
      description: description,
    });
    console.log("category Details -> ", categoryDetails);
  } catch (error) {
    console.log(error);
    return res.status(400).json({
      success: false,
      message: "Failed to create category, please try again",
    });
  }
};

//getAllCategory

exports.showAllCategory = async (req, res) => {
  try {
    const allCategory = await Categroy.find(
      {},
      { name: true, description: true }
    );
    return res.status(200).json({
      success: true,
      message: "All category retrieved successfully",
      allCategory,
    });
  } catch (error) {
    console.log(error);
    return res.status(400).json({
      success: false,
      message: "Failed to retrieve all category, please try again",
    });
  }
};

//categoryPageDetails

exports.categoryPageDetails = async (req, res) => {
  try {
    const { CategroyId } = req.body;

    //get course for the specified category
    const selectedCategory = await Course.findById(CategroyId)
      .populate("courses")
      .exec();

    //validation
    if (!selectedCategory) {
      return res.status(404).json({
        success: false,
        message: "Category not found",
      });
    }

    //get courses for different categories
    const differentCategories = await Categroy.find({
      _id: { $ne: CategroyId },
    })
      .populate("courses")
      .exec();

    //get top selling courses

    //return response

    //handle the case when category is not found

    //handle the case when there are no courses
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      success: false,
      message: "Failed to retrieve category page details, please try again",
    });
  }
};
