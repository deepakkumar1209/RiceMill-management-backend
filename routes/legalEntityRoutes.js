const express = require("express");

const router = express.Router();

const {
  createLegalEntity,
  getLegalEntities,
  updateLegalEntity,
  deleteLegalEntity,
} = require("../controllers/legalEntityController");

router.post("/", createLegalEntity);

router.get("/", getLegalEntities);

router.put("/:id", updateLegalEntity);

router.delete("/:id", deleteLegalEntity);

module.exports = router;