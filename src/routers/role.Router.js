const routerAPI = require('express').Router();
const roleController = require("../controllers/role.Controller");
const connectGR = require("../controllers/grouprole.Controller");

routerAPI.post("/role", roleController.createRole);
//routerAPI.get("/group", groupController.getAllGroup);
//routerAPI.delete("/group/:id", groupController.deleteGroup);
//routerAPI.put("/group/:id", groupController.updateGroup);

routerAPI.post("/grouprole", connectGR.createCGR); // add group role connection

module.exports = routerAPI