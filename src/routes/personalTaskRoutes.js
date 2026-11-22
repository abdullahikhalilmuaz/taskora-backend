const express = require("express");
const router = express.Router();
const {
  createPersonalTask,
  getMyPersonalTasks,
  getPersonalTaskById,
  updatePersonalTask,
  updatePersonalTaskStatus,
  deletePersonalTask,
} = require("../controllers/personalTaskController");
const { requireUser } = require("../middleware/auth");

router.post("/", requireUser, createPersonalTask);
router.get("/", requireUser, getMyPersonalTasks);
router.get("/:id", requireUser, getPersonalTaskById);
router.put("/:id", requireUser, updatePersonalTask);
router.put("/:id/status", requireUser, updatePersonalTaskStatus);
router.delete("/:id", requireUser, deletePersonalTask);

module.exports = router;
