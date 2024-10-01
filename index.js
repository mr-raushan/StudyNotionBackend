const express = require("express");
const app = express();

const userRoutes = require("./routes/userRoute");
const profileRoutes = require("./routes/profileRoute");
const courseRoutes = require("./routes/courseRoute");
const paymentRoutes = require("./routes/paymentRoute");

const database = require("./config/database");
const cookieParser = require("cookie-parser");
const { cloudinaryConnect } = require("./config/cloudinary");
const fileUpload = require("express-fileupload");
const dotenv = require("dotenv");
const cors = require("cors");

dotenv.config();
const PORT = process.env.PORT || 4000;

//db connection
database.connectDB();

//middleware
app.use(express.json());
app.use(cookieParser());
app.use(
  cors({
    origin: "http://localhost:5173",
    credentials: true,
  })
);

//Note that this option available for versions 1.0.0 and newer.
app.use(
  fileUpload({
    useTempFiles: true,
    tempFileDir: "/tmp/",
  })
);

//cloudinary connect
cloudinaryConnect();

//routes
app.use("api/v1/auth", userRoutes);
app.use("app/v1/profile", courseRoutes);
app.use("api/v1/course", paymentRoutes);
app.use("api/v1/payment", profileRoutes);

//def route
app.get("/", (req, res) => {
  return res.json({
    success: true,
    message: `Your server is up and running...`,
  });
});

app.listen(PORT, () => {
  console.log(`App is running on port ${PORT}`);
});
