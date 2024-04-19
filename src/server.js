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
app.use(cookieParser());
app.use(fileUpload());
const corsOptions = {
  origin: ["http://127.0.0.1:5173", "https://vue-project-tu.vercel.app/"],
  //origin: "https://vue-project-tu-1.onrender.com", // or a function returning this value based on request
  methods: "GET, POST, PUT, DELETE, OPTIONS",
  allowedHeaders: "X-Requested-With, Content-Type",
  credentials: true,
};

app.use(cors(corsOptions));

app.options("*", cors(corsOptions));

// Set view engine
configViewEngine(app);

// Setup routes
apiRouter(app);
// app.use(function (req, res, next) {
//   res.header(
//     "Access-Control-Allow-Origin",
//     "https://vue-project-tu.vercel.app"
//   );
//   res.header("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");

//   res.header("Access-Control-Allow-Headers", "X-Requested-With, Content-Type");

//   res.header("Access-Control-Allow-Credentials", true);
//   next();
// });

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
