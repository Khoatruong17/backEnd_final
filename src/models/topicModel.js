const mongoose = require("mongoose");
const topicSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      minlength: 6,
      maxlength: 20,
      unique: true,
    },
    description: {
      type: String,
      minlength: 6,
      maxlength: 100,
    },
    start_date: {
      type: Date,
      required: true,
    },
    end_date: {
      type: Date,
      required: true,
    },
    user_id: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: "users",
    },
    faculty_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "faculties",
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Topic", topicSchema);
