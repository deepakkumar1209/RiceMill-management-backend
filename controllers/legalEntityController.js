const LegalEntity = require("../models/LegalEntity");

exports.createLegalEntity = async (req, res) => {
  try {
    const data = await LegalEntity.create(req.body);

    res.status(201).json(data);
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

exports.getLegalEntities = async (req, res) => {
  try {
    const data = await LegalEntity.find();

    res.json(data);
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

exports.updateLegalEntity = async (req, res) => {
  try {
    const data =
      await LegalEntity.findByIdAndUpdate(
        req.params.id,
        req.body,
        {
          new: true,
        }
      );

    res.json(data);
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

exports.deleteLegalEntity = async (req, res) => {
  try {
    await LegalEntity.findByIdAndDelete(
      req.params.id
    );

    res.json({
      message: "Deleted Successfully",
    });
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};