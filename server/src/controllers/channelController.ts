import { Router, Request, Response } from "express";
import { Channel } from "../models/Channel";
import { User, IAuthenticatedUserRequest } from "../models/User";
import { Message } from "../models/Message";
import { verifyToken } from "../middlewares/verifyToken";
import { deleteChannel, getPrivateChannelsByUserId } from "../utils/database";
import { emitToUser, getSocketIO } from "../socket/socketManager";

export const channelController = Router();

// Get all channels that a user is part of, with optional filtering by type (public/private)
// check for reapted code
channelController.get('/', verifyToken, async (req: Request, res: Response) => {
    const { type } = req.query;

    const userId = (req as IAuthenticatedUserRequest).user._id;
        if (!userId) {
            res.status(400).json({ message: 'User ID is required' });
            return;
        }

    let channels;

    if (type && type === 'public') {
        channels = await Channel.find({ type: type });

    } else if (type && type === 'private') {
        channels = await getPrivateChannelsByUserId(userId);

    } else {
        const publicChannels = await Channel.find({type: "public"});
        const privateChannels = await getPrivateChannelsByUserId(userId);

        channels = [...publicChannels, ...privateChannels];
    }

    res.status(200).json(channels);
});

// Get messages of a specific channel by ID
channelController.get('/:id/messages', verifyToken, async (req: Request, res: Response) => {
    const { id } = req.params;
    const channel = await Channel.findById(id);
    if (!channel) {
        res.status(404).json({ message: 'Channel not found' });
        return;
    }

    if (channel.type === 'private') {
        const userId = (req as IAuthenticatedUserRequest).user._id;
        const user = await User.findById(userId);
        if (!user) {
            res.status(404).json({ message: 'User not found' });
            return;
        }
        if (!channel.users?.includes(user._id)) {
            res.status(403).json({ message: 'You are not part of this private channel' });
            return;
        }
    }

    await channel.populate({
        path: 'messages',
        populate: {
            path: 'from',
            select: 'username'
  },
});

    res.status(200).json(channel.messages);
});

// Get users of a specific channel by ID
channelController.get('/:id/users', verifyToken, async (req: Request, res: Response) => {
    const { id } = req.params;
    const channel = await Channel.findById(id);
    if (!channel) {
        res.status(404).json({ message: 'Channel not found' });
        return;
    }

    let users;
    if (channel.type !== 'private') {
        users = await User.find({}, '_id username');
    } else if (channel.type === 'private') {
        await channel.populate('users', '_id username');
        users = channel.users;
    }

    res.status(200).json(users);
});

// Create a new channel
channelController.post('/', verifyToken, async (req: Request, res: Response) => {
    const { name, type } = req.body;
    if (!name || !type) {
        res.status(400).json({ message: 'Name and type are required' });
        return;
    }

    if (type !== 'public' && type !== 'private') {
        res.status(400).json({ message: 'Type must be either public or private' });
        return;
    }

    const userId = (req as IAuthenticatedUserRequest).user._id;

    let channel;
    if (type === 'private') {
        channel = new Channel({ name, type, creator: userId, users: [userId] });
    } else {
        channel = new Channel({ name, type, creator: userId });
    }


    if (type === 'private') {
        // add user
        const user = await User.findById(userId).populate('privateChannels');
        if (!user) {
            res.status(404).json({ message: 'User not found' });
            return;
        }

        await channel.save();
        user.privateChannels.push(channel._id);
        await user.save();
    }
    else {
        await channel.save();
        
        // Emit real-time event for public channel creation
        const io = getSocketIO();
        if (io) {
            io.emit('publicChannelAdded', {
                id: channel._id.toString(),
                name: channel.name,
                type: channel.type,
                creator: channel.creator
            });
        }
    }

    res.status(201).json(channel);
});

// Create a new message in a specific channel
channelController.post('/:id/messages', verifyToken, async (req: Request, res: Response) => {

    const { id } = req.params;
    const { content } = req.body;

    if (!content) {
        res.status(400).json({ message: 'Content is required' });
        return;
    }

    const channel = await Channel.findById(id);
    if (!channel) {
        res.status(404).json({ message: 'Channel not found' });
        return;
    }

    const user = (req as IAuthenticatedUserRequest).user;
    if (!user) {
        res.status(401).json({ message: 'Unauthorized' });
        return;
    }

    const message = new Message({
        content,
        from: user._id,
        channel: channel._id,
        timestamp: new Date()
    });

    await message.save();
    channel.messages.push(message._id);
    await channel.save();
    await message.populate('from', 'username');
    res.status(201).json(message);
});

// Update the name of a channel by ID
// Only the creator of the channel can update its name
channelController.patch('/:id', verifyToken, async (req: Request, res: Response) => {
    const { id } = req.params;
    const { newName } = req.body;

    if (!newName) {
        res.status(400).json({ message: 'New name is required' });
        return;
    }
    const channel = await Channel.findById(id);
    if (!channel) {
        res.status(404).json({ message: 'Channel not found' });
        return;
    }

    const userId = (req as IAuthenticatedUserRequest).user._id;
    if (channel.creator.toString() !== userId.toString()) {
        res.status(403).json({ message: 'Only the creator can update the channel' });
        return;
    }

    channel.name = newName;
    await channel.save();
    
    // Emit real-time event for public channel name update
    if (channel.type === 'public') {
        const io = getSocketIO();
        if (io) {
            io.emit('publicChannelUpdated', {
                id: channel._id.toString(),
                name: channel.name,
                type: channel.type,
                creator: channel.creator
            });
        }
    }
    
    res.status(200).json(channel);
});

// Add a user to a private channel by username
// Only the creator of the channel can add users
channelController.patch('/:id/users/add', verifyToken, async (req: Request, res: Response) => {
    const { id } = req.params;
    const { username } = req.body;
    if (!username) {
        res.status(400).json({ message: 'Username is required' });
        return;
    }

    const user = await User.findOne({ username });
    if (!user) {
        res.status(404).json({ message: 'User not found' });
        return;
    }

    const channel = await Channel.findById(id);
    if (!channel) {
        res.status(404).json({ message: 'Channel not found' });
        return;
    }

    if (channel.type !== 'private') {
        res.status(400).json({ message: 'Only private channels can have users added' });
        return;
    }

    const userId = (req as IAuthenticatedUserRequest).user._id;
    if (channel.creator.toString() !== userId.toString()) {
        res.status(403).json({ message: 'Only the creator can add users to the channel' });
        return;
    }

    if (channel.users?.includes(user._id)) {
        res.status(400).json({ message: 'User is already part of this channel' });
        return;
    }

    channel.users?.push(user._id);
    await channel.save();
    user.privateChannels.push(channel._id);
    await user.save();
    
    // Emit websocket event to notify the added user about the new channel
    emitToUser(user._id.toString(), 'channelAdded', {
        id: channel._id.toString(),
        name: channel.name,
        type: channel.type,
        creator: channel.creator
    });

    // Also join the user to the channel socket room
    const io = getSocketIO();
    if (io) {
        // Find all sockets for this user and join them to the channel
        const sockets = await io.fetchSockets();
        const userSocket = sockets.find(socket => 
            (socket as any).user && (socket as any).user._id === user._id.toString()
        );
        if (userSocket) {
            userSocket.join(channel._id.toString());
        }
    }
    
    await channel.populate('users', '_id username');
    res.status(200).json(channel.users);
});

// Remove a user from a private channel by username
// Only the creator of the channel can remove users
channelController.patch('/:id/users/remove', verifyToken, async (req: Request, res: Response) => {
    const { id } = req.params;
    const { username } = req.body;
    if (!username) {
        res.status(400).json({ message: 'Username is required' });
        return;
    }

    const user = await User.findOne({ username });
    if (!user) {
        res.status(404).json({ message: 'User not found' });
        return;
    }

    const channel = await Channel.findById(id);
    if (!channel) {
        res.status(404).json({ message: 'Channel not found' });
        return;
    }

    if (channel.type !== 'private') {
        res.status(400).json({ message: 'Only private channels can have users removed' });
        return;
    }

    const userId = (req as IAuthenticatedUserRequest).user._id;
    if (channel.creator.toString() !== userId.toString()) {
        res.status(403).json({ message: 'Only the creator can remove users from the channel' });
        return;
    }

    if (!channel.users?.includes(user._id)) {
        res.status(400).json({ message: 'User is not part of this channel' });
        return;
    }

    // Emit kicked notification to all remaining users in the channel BEFORE removing the user
    const io = getSocketIO();
    if (io) {
        const kickedMessage = {
            sender: 'System',
            content: `${username} kicked`,
            timestamp: new Date(),
            channel: channel._id.toString()
        };
        
        console.log(`Emitting userKicked event for ${username} in channel ${channel._id}`);
        // Emit to all users in the channel EXCEPT the user being removed
        io.to(channel._id.toString()).emit('userKicked', kickedMessage);
    }

    // Remove user from channel and channel from user
    channel.users = channel.users.filter(u => u.toString() !== user._id.toString());
    await channel.save();
    user.privateChannels = user.privateChannels.filter(c => c.toString() !== channel._id.toString());
    await user.save();

    // Emit websocket event to notify the removed user about channel removal
    emitToUser(user._id.toString(), 'channelRemoved', {
        id: channel._id.toString(),
        name: channel.name,
        type: channel.type
    });

    // Also remove the user from the channel socket room
    if (io) {
        // Find all sockets for this user and remove them from the channel
        const sockets = await io.fetchSockets();
        const userSocket = sockets.find(socket => 
            (socket as any).user && (socket as any).user._id === user._id.toString()
        );
        if (userSocket) {
            userSocket.leave(channel._id.toString());
        }
    }

    await channel.populate('users', '_id username');
    res.status(200).json(channel.users);
});

// Delete a channel by ID
// Only the creator of the channel can delete it
channelController.delete('/:id', verifyToken, async (req: Request, res: Response) => {
    const { id } = req.params;

    const channel = await Channel.findById(id);
    if (!channel) {
        res.status(404).json({ message: 'Channel not found' });
        return;
    }

    const userId = (req as IAuthenticatedUserRequest).user._id;
    if (channel.creator.toString() !== userId.toString()) {
        res.status(403).json({ message: 'Only the creator can delete the channel' });
        return;
    }

    // Notify all users in the channel before deletion
    const io = getSocketIO();
    
    if (channel.type === 'private' && channel.users) {
        // Emit channelDeleted event to the entire channel room
        if (io) {
            io.to(channel._id.toString()).emit('channelDeleted', {
                id: channel._id.toString(),
                name: channel.name,
                type: channel.type,
                creator: channel.creator
            });
        }

        // Also emit channelRemoved to individual users for backward compatibility
        for (const userId of channel.users) {
            emitToUser(userId.toString(), 'channelRemoved', {
                id: channel._id.toString(),
                name: channel.name,
                type: channel.type,
                creator: channel.creator
            });
        }

        // Remove all users from the channel socket room
        if (io) {
            const sockets = await io.fetchSockets();
            for (const socket of sockets) {
                const socketUser = (socket as any).user;
                if (socketUser && channel.users.some(userId => userId.toString() === socketUser._id)) {
                    socket.leave(channel._id.toString());
                }
            }
        }
    } else if (channel.type === 'public') {
        // For public channels, emit to all users
        if (io) {
            io.emit('publicChannelRemoved', {
                id: channel._id.toString(),
                name: channel.name,
                type: channel.type,
                creator: channel.creator
            });
        }
    }

    await deleteChannel(id);
    res.status(204).send();
});

// Leave a private channel
// The creator of the channel cannot leave it
channelController.patch('/:id/leave', verifyToken, async (req: Request, res: Response) => {
    const { id } = req.params;
    const channel = await Channel.findById(id);
    if (!channel) {
        res.status(404).json({ message: 'Channel not found' });
        return;
    }

    if (channel.type !== 'private') {
        res.status(400).json({ message: 'Only private channels can be left' });
        return;
    }

    const userId = (req as IAuthenticatedUserRequest).user._id;
    if (channel.creator.toString() === userId.toString()) {
        res.status(400).json({ message: 'Creator cannot leave the channel' });
        return;
    }

    const user = await User.findById(userId);
    if (!user) {
        res.status(404).json({ message: 'User not found' });
        return;
    }

    if (!channel.users?.includes(user._id)) {
        res.status(400).json({ message: 'You are not part of this channel' });
        return;
    }

    // Remove user from channel and channel from user
    channel.users = channel.users.filter(u => u.toString() !== user._id.toString());
    await channel.save();
    user.privateChannels = user.privateChannels.filter(c => c.toString() !== channel._id.toString());
    await user.save();
    res.status(200).json({ message: 'Left the channel successfully' });
});



