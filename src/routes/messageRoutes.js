const express = require("express");
const router = express.Router();
const {
  getTaskMessages,
  postTaskMessage,
} = require("../controllers/messageController");
const { requireUser } = require("../middleware/auth");

router.get("/task/:taskId", requireUser, getTaskMessages);
router.post("/task/:taskId", requireUser, postTaskMessage);

module.exports = router;
