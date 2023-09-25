const mongoose = require("mongoose");

const connectDb = async () => {
  try {
    await mongoose.set("strictQuery", false);
    await mongoose.connect(process.env.mongoURI);

    console.log("MongoDB connected");
  } catch (error) {
    console.error(error.message);
    process.exit(1);
  }
};

module.exports = connectDb;
