const express = require("express");
const Role = require("../models/roleModel");

const createRole = async (req, res) => {
  try {
    // Create a new role
    const newRole = await new Role({
      url: req.body.url,
      description: req.body.description,
    });
    // Save the role to the database
    const role = await newRole.save();
    console.log("Add role successfully");
    res.status(200).json(role);
  } catch (error) {
    console.log("Error create role (controller): " + error);
    res.status(500).json({ error: error.message });
  }
};

const getAllGroup = async (req, res) => {
  try {
    const group = await Role.find();
    res.status(200).json(group);
    console.log("Get all groups successfully");
  } catch (error) {
    console.log("Error get all groups: " + error);
    res.status(500).json({ error: error.message });
  }
};

// const groupController = {

//   // Get all the groups
//   getAllGroup: async (req, res) => {
//     try {
//       const group = await Group.find();
//       res.status(200).json(group);
//       console.log("Get all groups successfully");
//     } catch (error) {
//       console.log("Error get all groups: " + error);
//       res.status(500).json({ error: error.message });
//     }
//   },

//   // Delete a group
//   deleteGroup: async (req, res) => {
//     try {
//       // Using findByIdAndDelete to delete the group
//       const group = await Group.findByIdAndDelete(req.params.id);
//       if (!group) {
//         return res.status(404).json({ message: "Group not found" });
//       }
//       res.status(200).json({ message: "Group deleted successfully" });
//       console.log(`Delete group successfully`);
//     } catch (error) {
//       console.log("Error deleting group: " + error);
//       res.status(500).json({ error: error.message });
//     }
//   },

//   // take a group for id
//   getAGroup: async (req, res) => {
//     try {
//       // Find the group by id
//       const group = await Group.findById(req.params.id);
//       if (!group) {
//         return res.status(404).json({ message: "Group not found" });
//       }
//       return res.status(200).json({
//         EM: "Group found",
//         EC: "0",
//         DT: group,
//       });
//     } catch (error) {
//       return res.status(500).json({
//         EM: "Something went wrong with server (controller)",
//         EC: "-1",
//         DT: "",
//       });
//     }
//   },

//   // update a group
//   updateGroup: async (req, res) => {
//     try {
//       const updatedGroupName = req.body.group_name;
//       // Find the group by id
//       const updatedGroup = await Group.findByIdAndUpdate(
//         req.params.id,
//         { group_name: updatedGroupName },
//         { new: true }
//       );
//       if (!updatedGroup) {
//         return res.status(404).json({ message: "Cannot find Group" });
//       }
//       console.log("Updated role successfully");
//       return res.status(200).json({
//         EM: "Update group successfully",
//         EC: "0",
//         DT: updatedGroup,
//       });
//     } catch (error) {
//       console.log("Error update role " + error);
//       res.status(500).json({ error: error.message });
//     }
//   },
// };

module.exports = {
  createRole,
  getAllGroup,
};
