const mongoose = require("mongoose");

const connectDB = async () => {
  try {
    const uri =
      process.env.MONGODB_URI ||
      "mongodb+srv://abdullahikhalilmuaz_db_user:VNY97wf84Zr7QGxA@Taskoramanagement.gw9c8ul.mongodb.net/?appName=Taskoramanagement";
    await mongoose.connect(uri);
    console.log("MongoDB connected successfully");
  } catch (err) {
    console.error("MongoDB connection error:", err.message);
    process.exit(1);
  }
};

module.exports = connectDB;
