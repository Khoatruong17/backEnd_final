const mongoose = require("mongoose");
const contributionSchema = new mongoose.Schema(
  {
    user_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "users",
    },
    topic_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "topics",
    },
    topic_name: {
      type: String,
    },
    faculty_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "faculty",
    },
    name: {
      type: String,
      required: true,
    },
    description: {
      type: String,
      required: true,
    },
    submit_date: {
      type: Date,
      required: true,
    },
    document: {
      type: [String],
    },
    comments: [
      {
        comment_id: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "comments",
        },
        comment: {
          type: String,
        },
      },
    ],
    status: {
      type: Number,
    },
  },
  { timestamps: true }
);
module.exports = mongoose.model("Contribution", contributionSchema);
