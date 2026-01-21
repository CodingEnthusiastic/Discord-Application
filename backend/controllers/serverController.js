const Server = require('../models/Server');
const Channel = require('../models/Channel');

exports.createServer = async (req, res) => {
    try {
        const { name, ownerId, ownerName } = req.body; // clerkId

        const newServer = new Server({
            name,
            owner: ownerId,
            members: [ownerId]
        });

        const savedServer = await newServer.save();

        // Create default 'general' channel
        const defaultChannel = new Channel({
            name: 'general',
            type: 'text',
            server: savedServer._id
        });

        await defaultChannel.save();

        // Link channel to server
        savedServer.channels.push(defaultChannel._id);
        await savedServer.save();

        res.status(201).json(savedServer);
    } catch (error) {
        console.error('Error creating server:', error);
        res.status(500).json({ error: 'Failed to create server' });
    }
};

exports.getUserServers = async (req, res) => {
    try {
        const { userId } = req.params; // clerkId
        // Find servers where user is in members array
        const servers = await Server.find({ members: userId });
        res.status(200).json(servers);
    } catch (error) {
        console.error('Error fetching servers:', error);
        res.status(500).json({ error: 'Failed to fetch servers' });
    }
};

exports.joinServer = async (req, res) => {
    try {
        const { inviteCode, userId } = req.body;

        const server = await Server.findOne({ inviteCode });
        if (!server) {
            return res.status(404).json({ error: 'Invalid invite code' });
        }

        if (server.members.includes(userId)) {
            return res.status(400).json({ error: 'Already a member' });
        }

        server.members.push(userId);
        await server.save();

        res.status(200).json(server);
    } catch (error) {
        console.error('Error joining server:', error);
        res.status(500).json({ error: 'Failed to join server' });
    }
};

exports.generateInvite = async (req, res) => {
    try {
        const { serverId } = req.params;
        const { userId } = req.body; // requester

        const server = await Server.findById(serverId);
        if (!server) return res.status(404).json({ error: 'Server not found' });

        // If no code exists, create one
        if (!server.inviteCode) {
            server.inviteCode = Math.random().toString(36).substring(2, 8).toUpperCase();
            await server.save();
        }

        res.status(200).json({ inviteCode: server.inviteCode });
    } catch (error) {
        console.error('Error creating invite:', error);
        res.status(500).json({ error: 'Failed to create invite' });
    }
};

exports.leaveServer = async (req, res) => {
    try {
        const { serverId } = req.params;
        const { userId } = req.body;

        const server = await Server.findById(serverId);
        if (!server) return res.status(404).json({ error: 'Server not found' });

        if (server.owner === userId) {
            return res.status(400).json({ error: 'Owner cannot leave server. Transfer ownership first.' });
        }

        server.members = server.members.filter(memberId => memberId !== userId);
        await server.save();

        res.status(200).json({ message: 'Left server successfully' });
    } catch (error) {
        console.error('Error leaving server:', error);
        res.status(500).json({ error: 'Failed to leave server' });
    }
};

exports.deleteServer = async (req, res) => {
    try {
        const { serverId } = req.params;
        const { userId } = req.body; // requester

        const server = await Server.findById(serverId);
        if (!server) return res.status(404).json({ error: 'Server not found' });

        if (server.owner !== userId) {
            return res.status(403).json({ error: 'Only owner can delete server' });
        }

        await Server.findByIdAndDelete(serverId);
        // Also delete associated channels? Ideally yes.
        // await Channel.deleteMany({ server: serverId });

        res.status(200).json({ message: 'Server deleted successfully' });
    } catch (error) {
        console.error('Error deleting server:', error);
        res.status(500).json({ error: 'Failed to delete server' });
    }
};

exports.updateServer = async (req, res) => {
    try {
        const { serverId } = req.params;
        const { userId, name, icon } = req.body;

        const server = await Server.findById(serverId);
        if (!server) return res.status(404).json({ error: 'Server not found' });

        if (server.owner !== userId) {
            // For strict RBAC, check MANAGE_SERVER. For now, owner only.
            return res.status(403).json({ error: 'Only owner can update server' });
        }

        if (name) server.name = name;
        if (icon) server.icon = icon;

        await server.save();
        res.status(200).json(server);
    } catch (error) {
        console.error('Error updating server:', error);
        res.status(500).json({ error: 'Failed to update server' });
    }
};

exports.createCategory = async (req, res) => {
    try {
        const { serverId } = req.params;
        const { userId, name } = req.body;

        const server = await Server.findById(serverId);
        if (!server) return res.status(404).json({ error: 'Server not found' });

        if (server.owner !== userId) {
            return res.status(403).json({ error: 'Only owner can create categories' });
        }

        if (server.categories.includes(name)) {
            return res.status(400).json({ error: 'Category already exists' });
        }

        server.categories.push(name);
        await server.save();
        res.status(200).json(server);
    } catch (error) {
        console.error('Error creating category:', error);
        res.status(500).json({ error: 'Failed to create category' });
    }
};

exports.deleteCategory = async (req, res) => {
    try {
        const { serverId, categoryName } = req.params;
        const { userId } = req.body;

        const server = await Server.findById(serverId);
        if (!server) return res.status(404).json({ error: 'Server not found' });

        if (server.owner !== userId) {
            return res.status(403).json({ error: 'Only owner can delete categories' });
        }

        server.categories = server.categories.filter(c => c !== categoryName);
        await server.save();

        // Optional: Move channels in this category to 'General' or handle on frontend
        await Channel.updateMany(
            { server: serverId, category: categoryName },
            { category: 'General' }
        );

        res.status(200).json(server);
    } catch (error) {
        console.error('Error deleting category:', error);
        res.status(500).json({ error: 'Failed to delete category' });
    }
};
