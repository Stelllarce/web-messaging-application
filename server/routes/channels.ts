import { Router, RequestHandler } from 'express';
import { Channel } from '../models/Channel';

const router = Router();

//Връща всички публични канали
const getPublicChannels: RequestHandler = async (req, res) => {
  try {
    const channels = await Channel.find({ type: 'public' });

    res.json(channels);
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
};

//Връща информация за конкретен канал
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

//канали, в които userId имат права
const getChannelsForUser: RequestHandler<{ userId: string }> = async (req, res) => {
    try {
      const { userId } = req.params;
  
      const channels = await Channel.find({
        $or: [
          { users: '*' },
          { users: userId }
        ]
      });
  
      res.json(channels);
    } catch (error) {
      res.status(500).json({ error: 'Server error' });
    }
  };
  
router.get('/', getPublicChannels);
router.get('/:id', getChannel);
router.get('/user/:userId', getChannelsForUser);


export default router;
