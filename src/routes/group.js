const express = require("express");
const router = express.Router();
const { authenticateCustomJWT, authorizeRoles } = require("../middleware/auth");
const {
  createDoc,
  registerTeam,
  getGroupRules,
} = require("../controllers/userController");

router.post(
  "/docs",
  authenticateCustomJWT,
  authorizeRoles(["STUDENT"]),
  createDoc
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

module.exports = router;
