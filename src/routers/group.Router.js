const routerAPI = require('express').Router();
const groupController = require("../controllers/group.Controller");

routerAPI.post("/group", groupController.createGroup);
routerAPI.get("/group", groupController.getAllGroup);
routerAPI.delete("/group/:id", groupController.deleteGroup);
routerAPI.put("/group/:id", groupController.updateGroup);

module.exports = routerAPI