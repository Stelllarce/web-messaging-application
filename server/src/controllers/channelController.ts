import { Router, Request, Response } from "express";
import { Channel } from "../models/Channel";
import { User } from "../models/User";
import { verifyToken } from "../middlewares/verifyToken";

export const channelController = Router();

channelController.get('/', verifyToken, async (req: Request, res: Response) => {
    const { type } = req.query;

    let channels;

    if (type) {
        channels = await Channel.find({ type: type });
    } else {
        channels = await Channel.find({});
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
        users = await User.find({}, 'username');
    } else if (channel.type === 'private') {
        await channel.populate('users', 'username');
        users = channel.users;
    }

    res.status(200).json(users);
});

