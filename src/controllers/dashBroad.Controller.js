const dashBroadService = require("../services/dashBroad.Service");
const jwtAction = require("../middleware/jwtAction");

const dashBroadAdmin = async (req, res) => {
  try {
    let data = await dashBroadService.dashBroadAdminService(req.body);
    return res.status(200).json({
      EM: data.EM,
      EC: data.EC,
      DT: data.DT,
    });
  } catch (error) {
    console.log(">>> Error show admin dash broad (Controller): " + error);
    return res.status(500).json({
      EM: "Error show admin dash broad (Controller): " + error,
      EC: 1,
    });
  }
};

const dashBroadCoordinator = async (req, res) => {
  try {
    let cookie = req.cookies;
    if (!cookie || Object.keys(cookie).length === 0) {
      return res.status(400).send("No cookies found. Please Login!!!");
    }
    const decoded = jwtAction.verifyToken(cookie.jwt);
    if (!decoded) {
      return res.status(400).send("Invalid cookie. Please Login!!!");
    }
    let data = await dashBroadService.dashBroadCoordinator(decoded);
    return res.status(data.status).json({
      EM: data.EM,
      EC: data.EC,
      DT: data.DT,
    });
  } catch (error) {
    console.log(">>> Error show coordinator dash broad (Controller): " + error);
    return res.status(500).json({
      EM: "Error show coordinator dash broad (Controller): " + error,
      EC: 1,
    });
  }
};

module.exports = {
  dashBroadAdmin,
  dashBroadCoordinator,
};
