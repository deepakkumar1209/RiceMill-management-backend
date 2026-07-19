const express = require("express");

const router = express.Router();

const {
  getMonthlyReport,
  closeMonth,
} = require("../controllers/monthlyReportController");

router.get("/", getMonthlyReport);

router.post("/close", closeMonth);

module.exports = router;