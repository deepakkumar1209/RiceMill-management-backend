const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    username: {
      type: String,
      required: true,
      unique: true
    },

    password: {
      type: String,
      required: true
    },

    isActive: {
      type: Boolean,
      default: true
    },

    role: {
      type: String,
      required: true
    },

    status: {
      type: String,
      default: "Active"
    },

    plotNo: String,
    street: String,
    location: String,
    city: String,
    taluk: String,
    district: String,
    state: String,
    country: String,
    pinCode: String,

    mobileNumber: String,
    fax: String,

    email: {
      type: String,
      unique: true,
      sparse: true
    }
  },
  {
    timestamps: true
  }
);

module.exports = mongoose.model("User", userSchema);