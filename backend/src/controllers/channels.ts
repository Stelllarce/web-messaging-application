import { Router, RequestHandler } from 'express';
import { Channel } from '../models/Channel';
import { Message } from '../models/Message';



const router = Router();

const getPublicChannels: RequestHandler = async (req, res) => {
  try {
    const channels = await Channel.find({ type: 'public' });
    res.json(channels);
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
};

const getChannel: RequestHandler<{ id: string }> = async (req, res) => {
  try {
    const { id } = req.params;
    const channel = await Channel.findById(id).populate('members', 'username');

    if (!channel) {
      res.status(404).json({ error: 'Channel not found' });
      return;
    }

    res.json(channel);
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
};

const getChannelsForUser: RequestHandler<{ userId: string }> = async (req, res) => {
  try {
    const { userId } = req.params;

    const channels = await Channel.find({
      type: 'private',
      members: userId
    });

    res.json(channels);
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
};


const getChannelMessagesForUser: RequestHandler<{ id: string }> = async (req, res) => {
  try {
    const { id } = req.params;

    const channels = await Channel.find({
      type: 'private',
      members: id
    });

    const result = [];

    for (const channel of channels) {
      const messages = await Message.find({ to: channel._id }) 
        .populate('from', 'username')
        .sort({ timestamp: 1 });

      result.push({
        channel,
        messages
      });
    }

    res.json(result);
  } catch (error) {
    console.error('Error retrieving chats in channels:', error);
    res.status(500).json({ error: 'Server error' });
  }
};


const getChannelParticipants: RequestHandler<{ id: string }> = async (req, res) => {
  try {
    const { id } = req.params;
    const channel = await Channel.findById(id).populate('members', 'username');

    if (!channel) {
      res.status(404).json({ error: 'Channel not found' });
      return;
    }

    res.json({
      _id: channel._id,
      name: channel.name,
      type: channel.type,
      members: channel.members,
    });
  } catch (err) {
    console.error('Error loading participants:', err);
    res.status(500).json({ error: 'Server error' });
  }
};


router.get('/', getPublicChannels);
router.get('/user/:userId', getChannelsForUser);
router.get('/:id/messages', getChannelMessagesForUser);
router.get('/:id/participants', getChannelParticipants);
router.get('/:id', getChannel);


export default router;
