const express = require("express");

const {
  createCustomerVendor,
  getCustomerVendors,
  getCustomerVendor,
  updateCustomerVendor,
  deleteCustomerVendor,
} = require("../controllers/customerVendorController");

const router = express.Router();

// Create Customer/Vendor
router.post("/", createCustomerVendor);

// Get All Customer/Vendors
router.get("/", getCustomerVendors);

// Get Single Customer/Vendor
router.get("/:id", getCustomerVendor);

// Update Customer/Vendor
router.put("/:id", updateCustomerVendor);

// Delete Customer/Vendor
router.delete("/:id", deleteCustomerVendor);

module.exports = router;