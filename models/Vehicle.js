const mongoose = require("mongoose");

const vehicleSchema =
  new mongoose.Schema(
    {
      vehicleNumber: {
        type: String,
        required: true,
      },

      vehicleType: {
        type: String,
        required: true,
      },

      driverName: {
        type: String,
        required: true,
      },

      mobileNumber: {
        type: String,
      },

      fuelType: {
        type: String,
      },
    },
    {
      timestamps: true,
    }
  );

module.exports =
  mongoose.model(
    "Vehicle",
    vehicleSchema
  );