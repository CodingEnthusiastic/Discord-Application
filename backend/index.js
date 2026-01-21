const express = require('express');
const http = require('http');
const mongoose = require('mongoose');
const cors = require('cors');
const { Server } = require('socket.io');
const User = require('./models/User');
require('dotenv').config();

// AI Notification Imports
const NotificationScheduler = require('./services/NotificationScheduler');
const ReminderScheduler = require('./services/ReminderScheduler');
const notificationRoutes = require('./routes/notificationRoutes');
const summaryReminderRoutes = require('./routes/summaryReminderRoutes');
const autoModRoutes = require('./routes/autoModRoutes');
const reactionRoutes = require('./routes/reactionRoutes');

const app = express();
const server = http.createServer(app);

app.use(cors({
    origin: "*",
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    credentials: true,
}));
app.use(express.json());

// -------- Socket.io Setup (Enhanced) --------
const io = new Server(server, {
    cors: {
        origin: "*", // Matches your frontend URL
        methods: ['GET', 'POST'],
        credentials: true
    },
    pingTimeout: 60000,
});

// Attach io to req for controllers
app.use((req, res, next) => {
    req.io = io;
    next();
});

// -------- Routes --------
const messageController = require('./controllers/messageController');
const serverController = require('./controllers/serverController');
const channelController = require('./controllers/channelController');

const conversationController = require('./controllers/conversationController');
const userController = require('./controllers/userController');

app.get('/', (req, res) => {
    res.send('✅ Discord Clone API is running');
});

// User Routes
app.post('/api/users/sync', userController.syncUser);
app.put('/api/users/:userId/preferences', userController.updatePreferences);

// Server Routes
app.post('/api/servers', serverController.createServer);
app.get('/api/users/:userId/servers', serverController.getUserServers);
app.post('/api/servers/join', serverController.joinServer);
app.post('/api/servers/:serverId/invite', serverController.generateInvite);
app.post('/api/servers/:serverId/leave', serverController.leaveServer);
app.delete('/api/servers/:serverId', serverController.deleteServer);
app.put('/api/servers/:serverId', serverController.updateServer);
app.post('/api/servers/:serverId/categories', serverController.createCategory);
app.delete('/api/servers/:serverId/categories/:categoryName', serverController.deleteCategory);

// Channel Routes
app.post('/api/channels', channelController.createChannel);
app.get('/api/servers/:serverId/channels', channelController.getServerChannels);
app.delete('/api/channels/:channelId', channelController.deleteChannel);

// Message Routes
app.post('/api/messages', messageController.sendMessage);
app.get('/api/channels/:channelId/messages', messageController.getMessages);
app.get('/api/conversations/:conversationId/messages', messageController.getConversationMessages);
app.get('/api/search', messageController.searchMessages);

// Conversation Routes
app.post('/api/conversations', conversationController.getOrCreateConversation);
app.get('/api/users/:userId/conversations', conversationController.getUserConversations);
app.delete('/api/conversations/:conversationId', conversationController.deleteConversation);

// -------- Notification Routes (AI-Powered) --------
app.use('/api/notifications', notificationRoutes);

// -------- Summary & Reminder Routes --------
app.use('/api/summary-reminder', summaryReminderRoutes);

// -------- AutoMod AI Routes --------
app.use('/api/automod', autoModRoutes);

// -------- Reaction Routes --------
app.use('/api/reactions', reactionRoutes);

// -------- Socket.io Events --------
io.on('connection', async (socket) => {
    const userId = socket.handshake.query.userId;
    console.log('✅ User connected:', socket.id, 'UserID:', userId);

    if (userId) {
        try {
            await User.findOneAndUpdate({ clerkId: userId }, { isOnline: true });
            socket.broadcast.emit('user_status_change', { userId, isOnline: true });
        } catch (err) {
            console.error('Error updating user status:', err);
        }
    }

    socket.on('join_channel', (channelId) => {
        socket.join(channelId);
        console.log(`👤 User ${socket.id} joined channel ${channelId}`);
    });

    socket.on('disconnect', async () => {
        console.log('❌ User disconnected:', socket.id);
        if (userId) {
            try {
                await User.findOneAndUpdate({ clerkId: userId }, { isOnline: false, lastSeen: new Date() });
                socket.broadcast.emit('user_status_change', { userId, isOnline: false, lastSeen: new Date() });
            } catch (err) {
                console.error('Error updating user status on disconnect:', err);
            }
        }
    });
});

const PORT = process.env.PORT || 5001;

// -------- AI Schedulers --------
let notificationScheduler = null;
let reminderScheduler = null;

const connectDB = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('🍃 Connected to MongoDB Atlas');
    } catch (err) {
        console.error('❌ MongoDB connection error:', err.message);
        // process.exit(1); 
    }
};

connectDB().then(() => {
    server.listen(PORT, () => {
        console.log(`🚀 Server running on port ${PORT}`);
        
        // Initialize AI Notification Scheduler
        try {
            notificationScheduler = new NotificationScheduler();
            notificationScheduler.initialize();
            console.log('🤖 AI Notification Scheduler initialized');
        } catch (error) {
            console.error('⚠️ Error initializing notification scheduler:', error.message);
            console.log('💡 Make sure GEMINI_API_KEY is set in .env file');
        }

        // Initialize Reminder Scheduler
        try {
            reminderScheduler = new ReminderScheduler();
            reminderScheduler.initialize();
            console.log('🔔 Reminder Scheduler initialized');
        } catch (error) {
            console.error('⚠️ Error initializing reminder scheduler:', error.message);
        }
    });
});

// Graceful shutdown
process.on('SIGINT', () => {
    if (notificationScheduler) {
        notificationScheduler.stop();
    }
    if (reminderScheduler) {
        reminderScheduler.stop();
    }
    process.exit(0);
});