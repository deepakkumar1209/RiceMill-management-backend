const Outward = require("../models/Outward");
const Item = require("../models/Item");
const {
    addOutward
} = require("../services/inventoryService");
// ===============================
// Create Outward
exports.createOutward=async(req,res)=>{

try{
    const totalWeight = Number(
      req.body.totalNetWeight ?? req.body.netWeight ?? 0
    );
    req.body.totalNetWeight = totalWeight;
    req.body.netWeight = totalWeight;

    // Calculate balanceRiceDue from item outlet if not provided
    if (req.body.balanceRiceDue === undefined || req.body.balanceRiceDue === null || req.body.balanceRiceDue === "") {
      let outturn = 100;
      if (req.body.item) {
        const item = await Item.findOne({ itemName: req.body.item });
        if (item && item.outlet) {
          outturn = Number(item.outlet);
        }
      }
      req.body.balanceRiceDue = Number(((totalWeight * outturn) / 100).toFixed(2));
    } else {
      req.body.balanceRiceDue = Number(req.body.balanceRiceDue || 0);
    }

    const totalBags =
      Number(req.body.onbg || 0) +
      Number(req.body.ssg || 0) +
      Number(req.body.swp || 0) +
      Number(req.body.usb || 0);

    req.body.noOfBags = totalBags;
    req.body.totalNoOfBags = totalBags;
    req.body.balanceNoOfBags = totalBags;

    if (!req.body.variety) {
      req.body.variety = "A";
    }

const outward=

await Outward.create(req.body);

await addOutward(outward);

res.status(201).json(outward);

}catch(error){

res.status(500).json({

message:error.message

});

}

}

// ===============================
// Get All Outward Records
// ===============================
exports.getOutwards = async (req, res) => {
  try {
    const outwards = await Outward.find().sort({
      createdAt: -1,
    });

    res.status(200).json(outwards);
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// ===============================
// Get Single Outward
// ===============================
exports.getOutward = async (req, res) => {
  try {
    const outward = await Outward.findById(
      req.params.id
    );

    if (!outward) {
      return res.status(404).json({
        success: false,
        message: "Outward not found",
      });
    }

    res.status(200).json(outward);
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// ===============================
// Update Outward
// ===============================
exports.updateOutward = async (req, res) => {
  try {
    if (req.body.totalNetWeight !== undefined || req.body.netWeight !== undefined) {
      const totalWeight = Number(
        req.body.totalNetWeight ?? req.body.netWeight ?? 0
      );
      req.body.totalNetWeight = totalWeight;
      req.body.netWeight = totalWeight;

      if (req.body.balanceRiceDue === undefined || req.body.balanceRiceDue === null || req.body.balanceRiceDue === "") {
        let outturn = 100;
        if (req.body.item) {
          const item = await Item.findOne({ itemName: req.body.item });
          if (item && item.outlet) {
            outturn = Number(item.outlet);
          }
        }
        req.body.balanceRiceDue = Number(((totalWeight * outturn) / 100).toFixed(2));
      }
    }

    if (
      req.body.onbg !== undefined ||
      req.body.ssg !== undefined ||
      req.body.swp !== undefined ||
      req.body.usb !== undefined
    ) {
      const totalBags =
        Number(req.body.onbg || 0) +
        Number(req.body.ssg || 0) +
        Number(req.body.swp || 0) +
        Number(req.body.usb || 0);

      req.body.noOfBags = totalBags;
      req.body.totalNoOfBags = totalBags;
      req.body.balanceNoOfBags = totalBags;
    }

    const outward =
      await Outward.findByIdAndUpdate(
        req.params.id,
        req.body,
        {
          new: true,
          runValidators: true,
        }
      );

    if (!outward) {
      return res.status(404).json({
        success: false,
        message: "Outward not found",
      });
    }

    res.status(200).json(outward);
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// ===============================
// Delete Outward
// ===============================
exports.deleteOutward = async (req, res) => {
  try {
    const outward = await Outward.findById(
      req.params.id
    );

    if (!outward) {
      return res.status(404).json({
        success: false,
        message: "Outward not found",
      });
    }

    await Outward.findByIdAndDelete(
      req.params.id
    );

    res.status(200).json({
      success: true,
      message:
        "Outward deleted successfully",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};
