const Dpc = require("../models/Dpc");

exports.createDpc = async (
  req,
  res
) => {
  try {
    const dpc =
      await Dpc.create(
        req.body
      );

    res.status(201).json(dpc);
  } catch (error) {
    res
      .status(500)
      .json({
        message:
          error.message,
      });
  }
};

exports.getDpcs = async (
  req,
  res
) => {
  try {
    const dpcs =
      await Dpc.find();

    res.json(dpcs);
  } catch (error) {
    res
      .status(500)
      .json({
        message:
          error.message,
      });
  }
};

exports.updateDpc =
  async (
    req,
    res
  ) => {
    try {
      const dpc =
        await Dpc.findByIdAndUpdate(
          req.params.id,
          req.body,
          {
            new: true,
          }
        );

      res.json(dpc);
    } catch (error) {
      res
        .status(500)
        .json({
          message:
            error.message,
        });
    }
  };

exports.deleteDpc =
  async (
    req,
    res
  ) => {
    try {
      await Dpc.findByIdAndDelete(
        req.params.id
      );

      res.json({
        message:
          "Dpc deleted",
      });
    } catch (error) {
      res
        .status(500)
        .json({
          message:
            error.message,
        });
    }
  };