const express = require("express");
const router = express.Router();
const { authenticateCustomJWT, authorizeRoles } = require("../middleware/auth");
const {
  createDoc,
  registerTeam,
  getGroupRules,
  getTeam,
} = require("../controllers/userController");
const { submitDeliverable } = require("../controllers/deliverableController");

router.post(
  "/docs",
  authenticateCustomJWT,
  authorizeRoles(["STUDENT"]),
  createDoc
);

// Submit Deliverable (Project Plan, Final Report, Video)
router.post(
  "/deliverables",
  authenticateCustomJWT,
  authorizeRoles(["STUDENT"]),
  submitDeliverable
);

// Get Rules
router.get(
  "/rules",
  authenticateCustomJWT,
  authorizeRoles(["STUDENT"]),
  getGroupRules
);

// Register Team
router.post(
  "/register",
  authenticateCustomJWT,
  authorizeRoles(["STUDENT"]),
  registerTeam
);

// Get My Team
router.get(
  "/my-team",
  authenticateCustomJWT,
  authorizeRoles(["STUDENT"]),
  getTeam
);

module.exports = router;
