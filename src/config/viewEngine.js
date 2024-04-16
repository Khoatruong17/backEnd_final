const path = require("path");
const express = require("express");
const cors = require("cors");
const cookieParser = require("cookie-parser");
const bodyParser = require("body-parser");

const configViewEngine = (app) => {
  app.set("views", path.join("./src", "views"));
  app.set("view engine", "ejs");
  //config static files
  app.use(express.static(path.join("./src", "public")));
  app.use(
    cors({
      origin: "vue-project-tu.vercel.app",
      credentials: true,
    })
  );
  app.use(cookieParser());
  app.use(express.json());
  app.use(bodyParser.json());
  app.use(bodyParser.urlencoded({ extended: true }));
};

module.exports = configViewEngine;
