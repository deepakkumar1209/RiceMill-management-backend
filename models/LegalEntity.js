const mongoose = require("mongoose");

const legalEntitySchema = new mongoose.Schema(
  {
    companyName: {
      type: String,
      required: true,
    },

    companyLogo: {
      type: String,
    },

    address: {
      type: String,
    },

    contactInformation: {
      type: String,
    },

    gstNumber: {
      type: String,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model(
  "LegalEntity",
  legalEntitySchema
);