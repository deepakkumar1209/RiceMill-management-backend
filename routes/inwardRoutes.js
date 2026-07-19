const express = require("express");

const {
  createInward,
  getInwards,
  getInward,
  updateInward,
  deleteInward,
} = require("../controllers/inwardController");

const router = express.Router();

// ===============================
// Create Inward
// POST /api/inwards
// ===============================
router.post("/", createInward);

// ===============================
// Get All Inwards
// GET /api/inwards
// ===============================
router.get("/", getInwards);

// ===============================
// Get Single Inward
// GET /api/inwards/:id
// ===============================
router.get("/:id", getInward);

// ===============================
// Update Inward
// PUT /api/inwards/:id
// ===============================
router.put("/:id", updateInward);

// ===============================
// Delete Inward
// DELETE /api/inwards/:id
// ===============================
router.delete("/:id", deleteInward);

module.exports = router;