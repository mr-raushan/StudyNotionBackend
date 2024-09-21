const mongoose = require("mongoose");
require("dotenv").config();

exports.connectDB = () => {
  mongoose
    .connect(process.env.MONGODB_URL, {})
    .then(() => {
      console.log("DB connection established");
    })
    .catch((error) => {
      console.log("DB Connection Issues");
      console.error(error);
      process.exit(1);
    });
};
