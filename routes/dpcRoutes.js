const express = require("express");

const router =
  express.Router();

const {
  createDpc,
  getDpcs,
  updateDpc,
  deleteDpc,
} = require(
  "../controllers/dpcController"
);

router.post(
  "/",
  createDpc
);

router.get(
  "/",
  getDpcs
);

router.put(
  "/:id",
  updateDpc
);

router.delete(
  "/:id",
  deleteDpc
);

module.exports =
  router;