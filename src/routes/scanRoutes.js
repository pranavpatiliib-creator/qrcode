/**
 * Scan API routes.
 */
const express = require("express");
const Scan = require("../models/Scan");
const { validateScanBody } = require("../middleware/validateScan");

const router = express.Router();

/**
 * POST /api/scan
 * Body: { id: string, source?: "camera" | "manual" | "sync" }
 */
router.post("/scan", validateScanBody, async (req, res, next) => {
  try {
    const { studentId, source } = req.validatedScan;

    await Scan.create({ studentId, source });

    return res.status(201).json({
      status: "success",
      message: "allowed",
      data: {
        id: studentId,
        scannedAt: new Date().toISOString()
      }
    });
  } catch (err) {
    // Mongo duplicate key error code for unique index violations.
    if (err && err.code === 11000) {
      return res.status(200).json({
        status: "success",
        message: "already taken",
        data: {
          id: req.validatedScan.studentId
        }
      });
    }

    return next(err);
  }
});

module.exports = router;