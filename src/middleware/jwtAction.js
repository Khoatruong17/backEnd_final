require("dotenv").config();
const JWT = require("jsonwebtoken");

const nonSecurePaths = ["/login", "/register", "/role"];

const createJWT = async (payload) => {
  try {
    let key = process.env.JWT_SECRET;
    let token = JWT.sign(payload, key);
    return token;
  } catch (error) {
    console.log(error);
    throw new Error("Error creating JWT");
  }
};

const verifyToken = (token) => {
  let key = process.env.JWT_SECRET;
  let decoded = null;
  try {
    decoded = JWT.verify(token, key);
  } catch (error) {
    console.log(error);
  }
  return decoded;
};

const checkUserJWT = (req, res, next) => {
  if (nonSecurePaths.includes(req.path)) return next();
  let cookies = req.cookies;
  if (cookies && cookies.jwt) {
    console.log("my jwt: ", cookies.jwt);
    let decoded = verifyToken(cookies.jwt);
    if (decoded) {
      req.user = decoded; //send data of user to server
      next();
    } else {
      return res.status(401).json({
        EM: "unauthorized",
        EC: "-1",
        DT: "",
      });
    }
  } else {
    return res.status(401).json({
      EM: "Not found cookie",
      EC: "-1",
      DT: "",
    });
  }
};

const checkUserPermission = (req, res, next) => {
  if (nonSecurePaths.includes(req.path)) return next();
  if (req.user) {
    let email = req.user.email;
    let role = req.user.groupWithRole.sRoles;
    let currentURL = req.path;
    if (!role || role.length === 0) {
      return res.status(403).json({
        EM: "User don't have permission to access this",
        EC: "-1",
        DT: "",
      });
    }
    let canAccess = role.some((item) => item.url === currentURL);
    if (canAccess === true) {
      next();
    } else {
      return res.status(403).json({
        EM: "User don't have permission to access this",
        EC: "-1",
        DT: "",
      });
    }
  } else {
    return res.status(401).json({
      EM: "Not authenticated the user",
      EC: "-1",
      DT: "",
    });
  }
};

module.exports = {
  createJWT,
  verifyToken,
  checkUserJWT,
  checkUserPermission,
};
