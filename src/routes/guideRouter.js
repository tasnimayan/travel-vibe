const express = require("express");
const { getGuides, getGuideDetails } = require("../controllers/guide/guideController");
const router = express.Router();

// Base route: /api/v2/guides
router.get("/", getGuides);
router.get("/:guideId", getGuideDetails);

module.exports = router;
