const Inward = require("../models/Inward");
const Item = require("../models/Item");
const { addInward} = require("../services/inventoryService");



// ===============================
// Create Inward
// ===============================
// Create Inward
// ===============================
exports.createInward = async (req, res) => {

  try {

    // Find the selected item
    const item = await Item.findOne({
      itemName: req.body.item
    });

    if (!item) {
      return res.status(404).json({
        message: "Item not found"
      });
    }

    // Always take Rice Outturn from Item Master
   req.body.riceOutturn = Number(item.outlet);

    // Save inward
    const inward = await Inward.create(req.body);

    // Update inventory
    await addInward(inward);

    res.status(201).json(inward);

  } catch (error) {

    res.status(500).json({
      message: error.message
    });

  }

};

// ===============================
// Get All Inward Records
// ===============================
exports.getInwards = async (req, res) => {
  try {
    const inwards = await Inward.find().sort({
      createdAt: -1,
    });

    res.status(200).json(inwards);
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// ===============================
// Get Single Inward
// ===============================
exports.getInward = async (req, res) => {
  try {
    const inward = await Inward.findById(
      req.params.id
    );

    if (!inward) {
      return res.status(404).json({
        success: false,
        message: "Inward not found",
      });
    }

    res.status(200).json(inward);
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// ===============================
// Update Inward
// ===============================
exports.updateInward = async (req, res) => {
  try {
    const inward =
      await Inward.findByIdAndUpdate(
        req.params.id,
        req.body,
        {
          new: true,
          runValidators: true,
        }
      );

    if (!inward) {
      return res.status(404).json({
        success: false,
        message: "Inward not found",
      });
    }

    res.status(200).json(inward);
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// ===============================
// Delete Inward
// ===============================
exports.deleteInward = async (req, res) => {
  try {
    const inward = await Inward.findById(
      req.params.id
    );

    if (!inward) {
      return res.status(404).json({
        success: false,
        message: "Inward not found",
      });
    }

    await Inward.findByIdAndDelete(
      req.params.id
    );

    res.status(200).json({
      success: true,
      message:
        "Inward deleted successfully",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

