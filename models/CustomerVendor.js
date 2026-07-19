const mongoose = require("mongoose");

const customerVendorSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },

    customerId: {
      type: String,
      required: true,
      unique: true,
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

    email: String,

    contactPerson: String,

    contactPersonMobileNumber: String,

    isCustomer: {
      type: Boolean,
      default: false,
    },

    isVendor: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model(
  "CustomerVendor",
  customerVendorSchema
);