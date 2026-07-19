const Outward = require("../models/Outward");
const {
    addOutward
} = require("../services/inventoryService");
// ===============================
// Create Outward
exports.createOutward=async(req,res)=>{

try{

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
