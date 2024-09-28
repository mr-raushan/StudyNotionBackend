const mongoose = require("mongoose");

const profileSchema = new mongoose.Schema({
  gender: {
    type: String,
    // required: true,
    // enum: ["Male", "Female", "Others"],
  },
  age: {
    type: Number,
    required: true,
  },
  about: {
    type: String,
    trim: true,
  },
  // mobile: {
  //   type: Number,
  //   trim: true,
  // },
  dateOfBirth: {
    type: String,
  },
});

module.exports = mongoose.model("Profile", profileSchema);
