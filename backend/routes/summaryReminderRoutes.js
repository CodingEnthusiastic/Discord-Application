const express = require('express');
const summaryReminderController = require('../controllers/summaryReminderController');

const router = express.Router();

/**
 * Chat Summary Routes
 */

// Request a summary for a specific period (1day, 3days, 7days)
router.post('/summary/request', summaryReminderController.requestSummary);

// Get all summaries for a user in a server
router.get('/summary/:userId/:serverId', summaryReminderController.getUserSummaries);

// Get specific summary by ID
router.get('/summary/detail/:summaryId', summaryReminderController.getSummaryById);

// Mark all summaries as read
router.put('/summary/:userId/:serverId/mark-read', summaryReminderController.markAllSummariesRead);

// Get unread summaries count
router.get('/summary/:userId/:serverId/unread-count', summaryReminderController.getUnreadCount);

// Delete specific summary
router.delete('/summary/:summaryId', summaryReminderController.deleteSummary);

/**
 * Reminder Preference Routes
 */

// Get reminder preferences
router.get('/reminder/preferences/:userId/:serverId', summaryReminderController.getReminderPreferences);

// Update reminder preferences
router.put('/reminder/preferences/:userId/:serverId', summaryReminderController.updateReminderPreferences);

// Toggle reminders on/off
router.put('/reminder/:userId/:serverId/toggle', summaryReminderController.toggleReminders);

// Update reminder sound settings
router.put('/reminder/:userId/:serverId/sound', summaryReminderController.updateReminderSound);

// Get reminder statistics
router.get('/reminder/stats/:userId/:serverId', summaryReminderController.getReminderStats);

module.exports = router;
