const routerAPI = require("express").Router();
const authController = require("../controllers/auth.Controller");
const commentController = require("../controllers/comment.Controller");
const contributionController = require("../controllers/contribution.Controller");
const facultyController = require("../controllers/faculty.Controller");
const groupController = require("../controllers/group.Controller");
const roleController = require("../controllers/role.Controller");
const connectGR = require("../controllers/grouprole.Controller");
const userController = require("../controllers/user.Controller");
const checkUser = require("../middleware/jwtAction");
const topicController = require("../controllers/topic.Controller");
const upFile = require("../controllers/file.Controller");
const sendEmail = require("../controllers/sendEmail.Controller");
const dashBroad = require("../controllers/dashBroad.Controller");
const path = require("path");

const initApiRouter = (app) => {
  // routerAPI.all("*", checkUser.checkUserJWT, checkUser.checkUserPermission);
  // routerAPI.all("*",);
  const handleRootPath = (req, res) => {
    res.sendFile(path.resolve(__dirname, "../public/viewReadMe.html"));
  };

  routerAPI.get("/", handleRootPath);
  // ------------- Dashboard --------------------------------
  routerAPI.get("/dashboardAdmin", dashBroad.dashBroadAdmin);
  routerAPI.get("/dashboardCoordinator", dashBroad.dashBroadCoordinator);

  // -------------  Register ----------
  routerAPI.post("/register", authController.Register);
  routerAPI.post("/login", authController.Login);
  routerAPI.post("/logout", authController.Logout);

  // User routes
  routerAPI.get("/user/getData", userController.getdataUser);
  routerAPI.get("/user/read", userController.getAllUser);
  routerAPI.put("/user/update", userController.editUser);
  routerAPI.put("/user/updatePasword", userController.updatePassword);
  routerAPI.delete("/user/delete", userController.deleteUser);

  // comment router
  routerAPI.post("/comment/create", commentController.createComment);
  routerAPI.get("/comment/readAll", commentController.getAllComment);
  routerAPI.delete("/comment/delete", commentController.deleteComment);
  routerAPI.put("/comment/update", commentController.updateComment);

  //get comment for student
  routerAPI.get("/commentforS/read", commentController.getCommentsForStudent);
  // get comments for coordinator (return time)
  routerAPI.get(
    "/commentforC/read",
    commentController.getCommentsForCoordinator
  );

  // contribution router
  routerAPI.post(
    "/contribution/create",
    contributionController.createContribution
  ); // get contribution by faculty_id
  routerAPI.get(
    "/contribution/readbyfaculty",
    contributionController.showcontributionbyFaculty
  ); // get contribution for Faculty
  routerAPI.get(
    "/contribution/readforGuest",
    contributionController.showcontributionForGuest
  ); // get all contribution
  routerAPI.get(
    "/contribution/readforStudent",
    contributionController.showcontributionForStudent
  ); // get all contribution
  routerAPI.get(
    "/contribution/read",
    contributionController.getAllContribution
  ); // get all contribution
  routerAPI.delete(
    "/contribution/delete/:id",
    contributionController.delContribution
  ); // delete
  routerAPI.get(
    "/contribution/download/:id",
    contributionController.downloadContribution
  ); // download contribution by id
  routerAPI.post("/contribution/setStatus", contributionController.setStatus); // set status for contribution

  // faculty router
  routerAPI.post("/faculty/create", facultyController.createFaculty);
  routerAPI.get("/faculty/readAll", facultyController.getAllFaculty);
  routerAPI.delete("/faculty/delete/:id", facultyController.deleteFaculty);
  routerAPI.put("/faculty/update/:id", facultyController.updateFaculty);

  // group router
  routerAPI.post("/group/create", groupController.createGroup);
  routerAPI.get("/group/readAll", groupController.getAllGroup);
  routerAPI.delete("/group/delete/:id", groupController.deleteGroup);
  routerAPI.put("/group/edit/:id", groupController.updateGroup);

  // role router
  routerAPI.post("/role/create", roleController.createRole);
  routerAPI.get("/role/readAll", roleController.getAllGroup);
  //routerAPI.delete("/group/:id", groupController.deleteGroup);
  //routerAPI.put("/group/:id", groupController.updateGroup);

  // topic router
  routerAPI.post("/topic/create", topicController.createTopic);
  //routerAPI.get("/topic/readAll", topicController.getAllTopic);
  routerAPI.get("/topic/readbyFaculty", topicController.showTopicbyFaculty);
  routerAPI.delete("/topic/delete/:id", topicController.deletedTopic);

  // routerAPI.put("/topic/:id", topic.updateTopic);

  // group role router
  routerAPI.post("/grouprole/create", connectGR.createCGR); // add group role connection

  //api upload file
  routerAPI.post("/file/single", upFile.postUploadSingleFile); // up single file to server
  routerAPI.post("/file/multiple", upFile.postUploadMultipleFiles); // up multiple file to server
  routerAPI.post("/file/image", upFile.uploadImage); // upload image
  // send Email
  routerAPI.post("/sendmail", sendEmail.sendMail); // send Email
  return app.use("/v1/", routerAPI);
  //return app.use("/", routerAPI);
};

module.exports = initApiRouter;
