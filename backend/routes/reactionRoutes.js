const express = require('express');
const router = express.Router();
const {
    addReaction,
    removeReaction,
    getMessageReactions,
    getTopReactions,
    userHasReacted
} = require('../controllers/reactionController');

/**
 * POST /api/reactions/add - Add reaction to message
 */
router.post('/add', addReaction);

/**
 * POST /api/reactions/remove - Remove reaction from message
 */
router.post('/remove', removeReaction);

/**
 * GET /api/reactions/:messageId - Get all reactions for a message
 */
router.get('/:messageId', getMessageReactions);

/**
 * GET /api/reactions/top - Get top reactions across server
 */
router.get('/stats/top', getTopReactions);

/**
 * GET /api/reactions/check - Check if user reacted with emoji
 */
router.get('/check', userHasReacted);

module.exports = router;
