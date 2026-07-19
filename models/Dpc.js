const mongoose = require("mongoose");

const dpcSchema = new mongoose.Schema({
  dpcName: {
    type: String,
    required: true,
  },

  dpcNumber: {
    type: String,
    required: true,
  },

  location: String,

  address: String,
});

module.exports = mongoose.model(
  "Dpc",
  dpcSchema
);