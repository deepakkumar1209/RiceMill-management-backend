const Vehicle =
  require("../models/Vehicle");

exports.createVehicle =
  async (req, res) => {
    try {
      const vehicle =
        await Vehicle.create(
          req.body
        );

      res.status(201).json(
        vehicle
      );
    } catch (error) {
      res.status(500).json({
        message:
          error.message,
      });
    }
  };

exports.getVehicles =
  async (req, res) => {
    try {
      const vehicles =
        await Vehicle.find();

      res.json(vehicles);
    } catch (error) {
      res.status(500).json({
        message:
          error.message,
      });
    }
  };

exports.updateVehicle =
  async (req, res) => {
    try {
      const vehicle =
        await Vehicle.findByIdAndUpdate(
          req.params.id,
          req.body,
          {
            new: true,
          }
        );

      res.json(vehicle);
    } catch (error) {
      res.status(500).json({
        message:
          error.message,
      });
    }
  };

exports.deleteVehicle =
  async (req, res) => {
    try {
      await Vehicle.findByIdAndDelete(
        req.params.id
      );

      res.json({
        message:
          "Vehicle Deleted",
      });
    } catch (error) {
      res.status(500).json({
        message:
          error.message,
      });
    }
  };