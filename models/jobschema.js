const mongoose = require("mongoose");

const jobSchema = new mongoose.Schema(
  {
    Name: { type: String, required: true },
    Role: { type: String, required: true },
    Location: { type: String, required: true },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "userSchema",
      required: false,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("jobSchema", jobSchema);
