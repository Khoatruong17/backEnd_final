const routerAPI = require('express').Router();
const facultyController = require("../controllers/faculty.Controller");

routerAPI.post("/faculty", facultyController.createFaculty);
routerAPI.get("/faculty", facultyController.getAllFaculty);
routerAPI.delete("/faculty/:id", facultyController.deleteFaculty);
routerAPI.put("/faculty/:id", facultyController.updateFaculty);

module.exports = routerAPI