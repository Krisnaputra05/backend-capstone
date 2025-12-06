const express = require("express");
const router = express.Router();
const { authenticateCustomJWT, authorizeRoles } = require("../middleware/auth");
const {
  createGroup,
  updateGroup,
  updateProjectStatus,
  listAllGroups,
  setGroupRules,
  validateGroupRegistration,
} = require("../controllers/adminController");
const { listDeliverables } = require("../controllers/adminDeliverableController");

// --- Rute Grup ---

// Create Group
router.post(
  "/groups",
  authenticateCustomJWT,
  authorizeRoles(["ADMIN"]), // Pastikan role sesuai (admin huruf kecil/besar tergantung sistem, user prompt bilang "admin")
  createGroup
);

// Update Group
router.put(
  "/groups/:groupId",
  authenticateCustomJWT,
  authorizeRoles(["ADMIN"]),
  updateGroup
);

// List All Groups
router.get(
  "/groups",
  authenticateCustomJWT,
  authorizeRoles(["ADMIN"]),
  listAllGroups
);

// --- Rute Project Status ---

// Update Project Status
router.put(
  "/project/:groupId",
  authenticateCustomJWT,
  authorizeRoles(["ADMIN"]),
  updateProjectStatus
);

// --- Rute Rules & Validation ---

// Set Group Rules
router.post(
  "/rules",
  authenticateCustomJWT,
  authorizeRoles(["ADMIN"]),
  setGroupRules
);

// Validate Group Registration
router.post(
  "/groups/:groupId/validate",
  authenticateCustomJWT,
  authorizeRoles(["ADMIN"]),
  validateGroupRegistration
);

// List Deliverables (Filtered)
router.get(
  "/deliverables",
  authenticateCustomJWT,
  authorizeRoles(["ADMIN"]),
  listDeliverables
);

module.exports = router;
