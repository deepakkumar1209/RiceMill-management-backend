const mongoose = require("mongoose");

const warehouseSchema =
  new mongoose.Schema(
    {
      warehouseName: {
        type: String,
        required: true,
      },

      warehouseNumber: {
        type: String,
        required: true,
      },

      location: String,
    },
    {
      timestamps: true,
    }
  );

module.exports =
  mongoose.model(
    "Warehouse",
    warehouseSchema
  );