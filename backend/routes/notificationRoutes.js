const express = require('express');
const notificationController = require('../controllers/notificationController');

const router = express.Router();

/**
 * Activity Logging Routes
 */
// Log a user activity event
router.post('/log-activity', notificationController.logActivity);

// Get user's activity history
router.get('/activity/:userId', notificationController.getActivityHistory);

/**
 * Notification Preference Routes
 */
// Get user's notification preferences
router.get('/preferences/:userId/:serverId', notificationController.getPreferences);

// Update user's notification preferences
router.put('/preferences/:userId/:serverId', notificationController.updatePreferences);

/**
 * Notification Decision Routes
 */
// Test notification decision (for debugging)
router.post('/test-decision', notificationController.testNotificationDecision);

// Record user ignoring a notification
router.post('/ignore', notificationController.ignoreNotification);

/**
 * Notification Stats Routes
 */
// Get user's notification statistics
router.get('/stats/:userId/:serverId', notificationController.getNotificationStats);

module.exports = router;
