const express = require("express");
const router = express.Router();
const {
  getMyNotifications,
  markRead,
  markAllRead,
  clearAll,
} = require("../controllers/notificationController");
const { requireUser } = require("../middleware/auth");

router.get("/", requireUser, getMyNotifications);
// IMPORTANT: /mark-all/read MUST come before /:id/read
router.put("/mark-all/read", requireUser, markAllRead);
router.put("/:id/read", requireUser, markRead);
router.delete("/clear", requireUser, clearAll);

module.exports = router;
