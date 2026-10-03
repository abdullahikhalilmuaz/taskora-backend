const express = require('express');
const router = express.Router();
const {
  getMyNotifications,
  markRead,
  markAllRead,
  clearAll,
} = require('../controllers/notificationController');
const { requireUser } = require('../middleware/auth');

router.get('/', requireUser, getMyNotifications);
router.put('/:id/read', requireUser, markRead);
router.put('/mark-all/read', requireUser, markAllRead);
router.delete('/clear', requireUser, clearAll);

module.exports = router;
