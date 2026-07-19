const CustomerVendor = require("../models/CustomerVendor");

// Create
exports.createCustomerVendor = async (req, res) => {
  try {
    const customerVendor = await CustomerVendor.create(req.body);

    res.status(201).json(customerVendor);
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Get All
exports.getCustomerVendors = async (req, res) => {
  try {
    const customerVendors = await CustomerVendor.find().sort({
      createdAt: -1,
    });

    res.status(200).json(customerVendors);
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Get Single
exports.getCustomerVendor = async (req, res) => {
  try {
    const customerVendor =
      await CustomerVendor.findById(req.params.id);

    if (!customerVendor) {
      return res.status(404).json({
        success: false,
        message: "Customer/Vendor not found",
      });
    }

    res.status(200).json(customerVendor);
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Update
exports.updateCustomerVendor = async (req, res) => {
  try {
    const customerVendor =
      await CustomerVendor.findByIdAndUpdate(
        req.params.id,
        req.body,
        {
          new: true,
          runValidators: true,
        }
      );

    if (!customerVendor) {
      return res.status(404).json({
        success: false,
        message: "Customer/Vendor not found",
      });
    }

    res.status(200).json(customerVendor);
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Delete
exports.deleteCustomerVendor = async (req, res) => {
  try {
    const customerVendor =
      await CustomerVendor.findById(req.params.id);

    if (!customerVendor) {
      return res.status(404).json({
        success: false,
        message: "Customer/Vendor not found",
      });
    }

    await CustomerVendor.findByIdAndDelete(req.params.id);

    res.status(200).json({
      success: true,
      message: "Customer/Vendor deleted successfully",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};