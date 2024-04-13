const express = require("express");
const Group = require("../models/groupModel");

const groupController = {
  //Create group
  createGroup: async (req, res) => {
    try {
      // Create a new group
      const newGroup = await new Group({
        group_name: req.body.group_name,
        description: req.body.description,
      });
      // Save the group to the database
      const group = await newGroup.save();
      console.log("Add group Successfully");
      res.status(200).json(group);
    } catch (error) {
      console.log("Error create group (controller): " + error);
      res.status(500).json({ error: error.message });
    }
  },

  // Get all the groups
  getAllGroup: async (req, res) => {
    try {
      const groups = await Group.find({ group_name: { $ne: "Admin" } });
      res.status(200).json(groups);
      console.log("Get all groups successfully");
    } catch (error) {
      console.log("Error get all groups: " + error);
      res.status(500).json({ error: error.message });
    }
  },

  // Delete a group
  deleteGroup: async (req, res) => {
    try {
      // Using findByIdAndDelete to delete the group
      const group = await Group.findByIdAndDelete(req.params.id);
      if (!group) {
        return res.status(404).json({ message: "Group not found" });
      }
      res.status(200).json({ message: "Group deleted successfully" });
      console.log(`Delete group successfully`);
    } catch (error) {
      console.log("Error deleting group: " + error);
      res.status(500).json({ error: error.message });
    }
  },

  // take a group for id
  getAGroup: async (req, res) => {
    try {
      // Find the group by id
      const group = await Group.findById(req.params.id);
      if (!group) {
        return res.status(404).json({ message: "Group not found" });
      }
      return res.status(200).json({
        EM: "Group found",
        EC: "0",
        DT: group,
      });
    } catch (error) {
      return res.status(500).json({
        EM: "Something went wrong with server (controller)",
        EC: "-1",
        DT: "",
      });
    }
  },

  // update a group
  updateGroup: async (req, res) => {
    try {
      const updatedGroupName = req.body.group_name;
      // Find the group by id
      const updatedGroup = await Group.findByIdAndUpdate(
        req.params.id,
        { group_name: updatedGroupName },
        { new: true }
      );
      if (!updatedGroup) {
        return res.status(404).json({ message: "Cannot find Group" });
      }
      console.log("Updated role successfully");
      return res.status(200).json({
        EM: "Update group successfully",
        EC: "0",
        DT: updatedGroup,
      });
    } catch (error) {
      console.log("Error update role " + error);
      res.status(500).json({ error: error.message });
    }
  },
};

module.exports = groupController;
