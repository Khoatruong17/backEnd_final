const routerAPI = require('express').Router();
const authController = require("../controllers/auth.Controller");


routerAPI.post("/register", authController.Register);
routerAPI.post("/login", authController.Login);

module.exports = routerAPI