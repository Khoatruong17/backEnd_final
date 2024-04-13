const User = require("../models/userModel");
const Role = require("../models/roleModel");
const Group = require("../models/groupModel");
const GroupRole = require("../models/grouproleModel");

const GetGroupWithRole = async (userId) => {
  try {
    const user = await User.findById(userId);
    if (!user) {
      throw new Error("User not found");
    }
    const group = await Group.findById(user.group.group_id);
    if (!group) {
      throw new Error("Group not found");
    }
    console.log(group);

    const groupRoles = await GroupRole.find({ group_id: group._id });
    if (!groupRoles) {
      console.log(groupRoles);
      throw new Error("Group roles not found or not created connection");
    }
    console.log(groupRoles);
    const roleIds = groupRoles.map((r) => r.role_id);
    const roles = await Role.find({ _id: { $in: roleIds } });
    if (!roles || roles.length === 0) {
      throw new Error("Roles not found or not created connection");
    }
    console.log(">>> Roles");
    console.log(roles);
    const sRoles = roles.map((role) => ({
      url: role.url,
      description: role.description,
    }));
    return { sRoles, group };
  } catch (error) {
    console.error(error.message);
    throw error;
  }
};

module.exports = {
  GetGroupWithRole,
};
