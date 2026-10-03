const express = require('express');
const router = express.Router();
const { getTaskMessages } = require('../controllers/messageController');
const { requireUser } = require('../middleware/auth');

router.get('/task/:taskId', requireUser, getTaskMessages);

module.exports = router;
