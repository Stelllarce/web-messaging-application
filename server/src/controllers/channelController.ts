import { Router, Request, Response } from "express";
import { Channel } from "../models/Channel";
import { User } from "../models/User";
import { verifyToken } from "../middlewares/verifyToken";
import { IUser, IAuthenticatedUserRequest } from "../models/User";
import { getPrivateChannelsByUserId } from "../utils/database";

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

channelController.get('/:id/messages', verifyToken, async (req: Request, res: Response) => {
    const { id } = req.params;
    const channel = await Channel.findById(id);

    if (!channel) {
        res.status(404).json({ message: 'Channel not found' });
        return;
    }

    await channel.populate('messages');

    res.status(200).json(channel.messages);
});

channelController.get('/:id/users ', verifyToken, async (req: Request, res: Response) => {
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

    let channel;
    if (type === 'private') {
        const user = (req as IAuthenticatedUserRequest).user;
        channel = new Channel({ name, type, users: [user._id] });
    } else {
        channel = new Channel({ name, type });
    }

    await channel.save();

    if (type === 'private') {
        const userId = (req as IAuthenticatedUserRequest).user._id;
        const user = await User.findById(userId).populate('privateChannels');
        if (!user) {
            res.status(404).json({ message: 'User not found' });
            return;
        }
        user.privateChannels.push(channel._id);
        await user.save();
    }

    res.status(201).json(channel);
});