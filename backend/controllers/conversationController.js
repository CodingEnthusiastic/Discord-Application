const Conversation = require('../models/Conversation');
const User = require('../models/User');
const Message = require('../models/Message');

exports.getOrCreateConversation = async (req, res) => {
    try {
        const { user1Id, user2Id } = req.body;

        // Check if conversation exists (bidirectional check)
        let conversation = await Conversation.findOne({
            participants: { $all: [user1Id, user2Id] }
        });

        if (!conversation) {
            conversation = new Conversation({
                participants: [user1Id, user2Id]
            });
            await conversation.save();
        }

        res.status(200).json(conversation);
    } catch (error) {
        console.error('Error creating conversation:', error);
        res.status(500).json({ error: 'Failed to create conversation' });
    }
};

exports.getUserConversations = async (req, res) => {
    try {
        const { userId } = req.params;
        const conversations = await Conversation.find({ participants: userId })
            .sort({ updatedAt: -1 });

        // Manually populate participant details
        const populatedConversations = await Promise.all(conversations.map(async (conv) => {
            // console.log(`[DEBUG] Processing conversation ${conv._id} with participants:`, conv.participants);

            // Check if participants are valid
            if (!conv.participants || conv.participants.length === 0) {
                // console.log(`[DEBUG] No participants found for conversation ${conv._id}`);
                return conv.toObject();
            }

            // Fetch user details for each participant
            const participantsDetails = await User.find({
                clerkId: { $in: conv.participants }
            }).select('clerkId username avatar email isOnline lastSeen');

            // console.log(`[DEBUG] Found ${participantsDetails.length} users for conversation ${conv._id}`);
            // if (participantsDetails.length === 0) {
            //     console.log(`[DEBUG] WARNING: No users found matching clerkIds: ${conv.participants.join(', ')}`);
            // } else {
            //     participantsDetails.forEach(u => console.log(`[DEBUG] Match: ${u.username} (${u.clerkId})`));
            // }

            return {
                ...conv.toObject(),
                participants: participantsDetails.map(user => ({
                    _id: user.clerkId, // Frontend uses ._id matching clerkId
                    username: user.username,
                    imageUrl: user.avatar, // Map avatar to imageUrl for frontend consistency
                    username: user.username,
                    imageUrl: user.avatar, // Map avatar to imageUrl for frontend consistency
                    firstName: user.username, // Fallback for frontend
                    isOnline: user.isOnline,
                    lastSeen: user.lastSeen
                }))
            };
        }));

        // console.log('[DEBUG] Populated Conversations:', JSON.stringify(populatedConversations, null, 2));

        res.status(200).json(populatedConversations);
    } catch (error) {
        console.error('Error fetching conversations:', error);
        res.status(500).json({ error: 'Failed to fetch conversations' });
    }
};

exports.deleteConversation = async (req, res) => {
    try {
        const { conversationId } = req.params;

        // Check if conversation exists
        const conversation = await Conversation.findById(conversationId);
        if (!conversation) {
            return res.status(404).json({ error: 'Conversation not found' });
        }

        // Delete conversation
        await Conversation.findByIdAndDelete(conversationId);

        // Cascading delete: Remove all messages in this conversation
        await Message.deleteMany({ conversation: conversationId });

        res.status(200).json({ message: 'Conversation deleted successfully' });
    } catch (error) {
        console.error('Error deleting conversation:', error);
        res.status(500).json({ error: 'Failed to delete conversation' });
    }
};

