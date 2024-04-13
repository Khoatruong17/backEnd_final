const mongoose = require("mongoose");
const GroupRoleSchema = new mongoose.Schema(
  {
    group_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "groups",
    },
    group_name: {
      type: mongoose.Schema.Types.String,
      ref: "groups",
    },
    role_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "roles",
    },
    description: {
      type: String,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("group_role", GroupRoleSchema);
