const Channel = require('../models/Channel');
const Server = require('../models/Server');

exports.createChannel = async (req, res) => {
    try {
        const { name, type, category, serverId, userId } = req.body;

        // Permission Check - get server first
        const server = await Server.findById(serverId);
        if (!server) {
            console.log('Server not found');
            return res.status(404).json({ error: 'Server not found' });
        }

        // Strict Admin Check
        if (server.owner !== userId) {
            console.log('Permission denied. Owner:', server.owner, 'User:', userId);
            return res.status(403).json({ error: 'Only the server owner can create channels.' });
        }

        const newChannel = new Channel({
            name,
            type: type || 'text',
            category: category || 'General',
            server: serverId
        });

        const savedChannel = await newChannel.save();
        
        // Use updateOne instead of findByIdAndUpdate (faster)
        await Server.updateOne({ _id: serverId }, {
            $push: { channels: savedChannel._id }
        });

        console.log('Channel created:', savedChannel);
        res.status(201).json(savedChannel);
    } catch (error) {
        console.error('Error creating channel FULL STACK:', error);
        res.status(500).json({ error: 'Failed to create channel' });
    }
};

exports.getServerChannels = async (req, res) => {
    try {
        const { serverId } = req.params;
        const channels = await Channel.find({ server: serverId });
        res.status(200).json(channels);
    } catch (error) {
        console.error('Error fetching channels:', error);
        res.status(500).json({ error: 'Failed to fetch channels' });
    }
};

exports.deleteChannel = async (req, res) => {
    try {
        const { channelId } = req.params;
        const { userId } = req.body;

        const channel = await Channel.findById(channelId);
        if (!channel) return res.status(404).json({ error: 'Channel not found' });

        const server = await Server.findById(channel.server);
        if (server.owner !== userId) {
            return res.status(403).json({ error: 'Only owner can delete channels' });
        }

        await Channel.findByIdAndDelete(channelId);

        // Remove from server
        server.channels = server.channels.filter(c => c.toString() !== channelId);
        await server.save();

        res.status(200).json({ message: 'Channel deleted' });
    } catch (error) {
        console.error('Error deleting channel:', error);
        res.status(500).json({ error: 'Failed to delete channel' });
    }
};
