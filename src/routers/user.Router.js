const routerAPI = require("express").Router();
const userController = require("../controllers/user.Controller");

routerAPI.get("/users", userController.getAllUser);
//routerAPI.post("/login", userController.Login);

module.exports = routerAPI;
