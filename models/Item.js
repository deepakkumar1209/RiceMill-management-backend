const mongoose = require("mongoose");

const itemSchema = new mongoose.Schema(
  {
    itemNumber: {
      type: String,
      required: true,
    },

    itemName: {
      type: String,
      required: true,
    },

    itemType: {
      type: String,
      required: true,
    },

    unitOfMeasure: {
      type: String,
      required: true,
    },
    outlet: {
  type: String,
  required: true,
},
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model(
  "Item",
  itemSchema
);