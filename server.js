const express = require("express");
const app = express();
const connectDb = require("./config/db");
require("dotenv").config();

//Connect database
connectDb();

//init middleware
app.use(express.json());
const PORT = process.env.PORT || 8000;

//Define route
app.use("/api/users", require("./routes/api/users"));
app.use("/api/auth", require("./routes/api/auth"));
app.use("/api/profile", require("./routes/api/profile"));
app.use("/api/posts", require("./routes/api/posts"));

app.listen(PORT, () => {
  console.log(`Server started on port ${PORT}`);
});
