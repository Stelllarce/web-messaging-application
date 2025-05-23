import { Router } from 'express';
import { Channel } from '../models/Channel';
import { User } from '../models/User';

const router = Router();

router.get('/', async (req, res) => {
  try {
    const publicChannels = await Channel.find({ type: 'public' });

    const privateChannels = await Channel.find({ type: 'private' }).populate('members');
    const people: any[] = [];
    const group: any[] = [];

    privateChannels.forEach(chan => {
      if (chan.members.length === 2) {
        people.push(chan);
      } else {
        group.push(chan);
      }
    });

    const me = await User.findOne({ isMe: true });

    res.json({
      public: publicChannels,
      private: {
        group,
        people,
        me
      }
    });
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

export default router;
