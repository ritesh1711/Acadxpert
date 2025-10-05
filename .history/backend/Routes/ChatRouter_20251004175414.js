const express = require('express');
const router = express.Router();
const verifyToken = require('../Middlewares/authMiddleware');
const verifyAdmin = require('../Middlewares/adminMiddleware');
const Chat = require('../Controllers/ChatController');

// Student routes
router.post('/ai',verify
     Chat.askAI);
router.post('/admin', verifyToken, Chat.sendToAdmin);
router.get('/admin/thread', verifyToken, Chat.listMyAdminThread);

// Admin routes
router.get('/admin/threads', verifyToken, verifyAdmin, Chat.listAdminThreads);
router.get('/admin/threads/:studentId', verifyToken, verifyAdmin, Chat.getAdminThread);
router.post('/admin/threads/:studentId/reply', verifyToken, verifyAdmin, Chat.replyToStudent);

module.exports = router;



