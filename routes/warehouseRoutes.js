const express =
  require("express");

const router =
  express.Router();

const {
  createWarehouse,
  getWarehouses,
  updateWarehouse,
  deleteWarehouse,
} = require(
  "../controllers/warehouseController"
);

router.get("/", getWarehouses);

router.post("/", createWarehouse);

router.put("/:id", updateWarehouse);

router.delete("/:id", deleteWarehouse);

module.exports = router;