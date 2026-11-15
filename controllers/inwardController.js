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
      itemName: req.body.item,
    });

    if (!item) {
      return res.status(404).json({
        message: "Item not found",
      });
    }

    // Always take Rice Outturn from Item Master
    const outturn = Number(item.outlet || 0);
    req.body.riceOutturn = outturn;

    const totalWeight = Number(
      req.body.totalNetWeight ?? req.body.netWeight ?? 0
    );
    req.body.totalNetWeight = totalWeight;
    req.body.netWeight = totalWeight;

    // Automatically calculate Total Rice Due
    req.body.totalRiceDue = Number(
      ((totalWeight * outturn) / 100).toFixed(2)
    );

    // Calculate total bags including USB
    const totalBags =
      Number(req.body.nbg || 0) +
      Number(req.body.onb || 0) +
      Number(req.body.ssg || 0) +
      Number(req.body.swp || 0) +
      Number(req.body.usb || 0);

    req.body.noOfBags = totalBags;
    req.body.totalNoOfBags = totalBags;

    // Save inward
    const inward = await Inward.create(req.body);

    // Update inventory
    await addInward(inward);

    res.status(201).json(inward);
  } catch (error) {
    res.status(500).json({
      message: error.message,
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
    if (req.body.item) {
      const item = await Item.findOne({ itemName: req.body.item });
      if (item) {
        req.body.riceOutturn = Number(item.outlet || 0);
      }
    }

    if (req.body.totalNetWeight !== undefined || req.body.netWeight !== undefined) {
      const totalWeight = Number(
        req.body.totalNetWeight ?? req.body.netWeight ?? 0
      );
      req.body.totalNetWeight = totalWeight;
      req.body.netWeight = totalWeight;
      const outturn = Number(req.body.riceOutturn || 0);
      if (outturn > 0) {
        req.body.totalRiceDue = Number(
          ((totalWeight * outturn) / 100).toFixed(2)
        );
      }
    }

    if (
      req.body.nbg !== undefined ||
      req.body.onb !== undefined ||
      req.body.ssg !== undefined ||
      req.body.swp !== undefined ||
      req.body.usb !== undefined
    ) {
      const totalBags =
        Number(req.body.nbg || 0) +
        Number(req.body.onb || 0) +
        Number(req.body.ssg || 0) +
        Number(req.body.swp || 0) +
        Number(req.body.usb || 0);

      req.body.noOfBags = totalBags;
      req.body.totalNoOfBags = totalBags;
    }

    const inward = await Inward.findByIdAndUpdate(
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

