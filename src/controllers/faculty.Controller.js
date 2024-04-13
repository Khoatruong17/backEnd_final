const express = require("express");
const Faculties = require("../models/facultyModel");

const facultyController = {
  //Create faculty
  createFaculty: async (req, res) => {
    try {
      const existingFaculty = await Faculties.findOne({
        faculty_name: req.body.faculty_name,
      });
      if (existingFaculty) {
        return res
          .status(400)
          .json({ error: "Faculty name have exist, please try again!!!" });
      }
      // Create a new faculty
      const newFaculty = await new Faculties({
        faculty_name: req.body.faculty_name,
      });

      // Save the faculty to the database
      const faculty = await newFaculty.save();
      console.log("Add faculty Successfully");
      res.status(200).json(faculty);
    } catch (error) {
      console.log("Error create faculty: " + error);
      res.status(500).json({ error: error.message });
    }
  },

  // Get all the faculties
  getAllFaculty: async (req, res) => {
    try {
      const faculty = await Faculties.find();
      res.status(200).json(faculty);
      console.log("Get all faculties successfully");
    } catch (error) {
      console.log("Error get all faculties: " + error);
      res.status(500).json({ error: error.message });
    }
  },

  // Delete a role
  deleteFaculty: async (req, res) => {
    try {
      // Using findByIdAndDelete to delete the faculty
      const faculty = await Faculties.findByIdAndDelete(req.params.id);
      if (!faculty) {
        return res.status(404).json({ message: "Faculty not found" });
      }
      res.status(200).json({ message: "Faculty deleted successfully" });
      console.log(`Delete faculty successfully`);
    } catch (error) {
      console.log("Error deleting faculty: " + error);
      res.status(500).json({ error: error.message });
    }
  },

  updateFaculty: async (req, res) => {
    try {
      const updatedFacultyName = req.body.faculty_name;
      // Find the role by id
      const updatedFaculty = await Faculties.findByIdAndUpdate(
        req.params.id,
        { faculty_name: updatedFacultyName },
        { new: true }
      );
      if (!updatedFaculty) {
        return res.status(404).json({ message: "Cannot find faculty" });
      }
      console.log("Updated faculty successfully");
      res.status(200).json(updatedFaculty);
    } catch (error) {
      console.log("Error update faculty " + error);
      res.status(500).json({ error: error.message });
    }
  },
};

module.exports = facultyController;
