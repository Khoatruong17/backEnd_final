require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const path = require("path");
const bodyParser = require("body-parser");
const cookieParser = require("cookie-parser");
const fileUpload = require("express-fileupload");
const cors = require("cors");
const morgan = require("morgan");
const apiRouter = require("./routers/api.Router");
const configViewEngine = require("./config/viewEngine");
const connection = require("./config/database");

const app = express();
const port = process.env.PORT || 10000;

// Middleware
app.use(morgan("dev")); // Logging middleware
app.use(bodyParser.json());
app.use(fileUpload());
app.use(cors()); // Place CORS middleware here

// Set view engine
configViewEngine(app);

// Setup routes
apiRouter(app);

// z setup (Moved up before any routes)
// app.use(function (req, res, next) {
//   res.header(
//     "Access-Control-Allow-Origin",
//     "https://vue-project-tu.vercel.app"
//   );

//   res.header(
//     "Access-Control-Allow-Headers",
//     "Origin, X-Requested-With, Content-Type, Accept"
//   );

//   res.header("Access-Control-Allow-Credentials", "true");
//   next();
// });

app.use(function (req, res, next) {
  res.header(
    "Access-Control-Allow-Origin",
    "https://vue-project-tu.vercel.app"
  );
  res.header("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");

  res.header("Access-Control-Allow-Headers", "X-Requested-With, Content-Type");

  res.header("Access-Control-Allow-Credentials", true);
  next();
});

// 404 handler
app.use((req, res) => {
  return res.send("404 Not Found");
});

app.listen(port, async () => {
  try {
    await connection();
    console.log(`App is running at ${port}`);
  } catch (err) {
    console.log(">>> Err when starting server: " + err);
  }
});
