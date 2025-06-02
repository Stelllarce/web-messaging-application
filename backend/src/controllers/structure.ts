import { Router, Request, Response } from 'express';
import { Channel } from '../models/Channel';
import { User } from '../models/User';

const router = Router();

interface MemberUser {
  username: string;
  _id: string;
}

interface PopulatedChannel {
  _id: string;
  name: string;
  type: 'private';
  members: MemberUser[];
}

router.get('/', async (req: Request, res: Response) => {
  try {
    const publicChannels = await Channel.find({ type: 'public' });

    const privateChannels = await Channel
      .find({ type: 'private' })
      .populate('members', 'username') as unknown as PopulatedChannel[];


    const people: PopulatedChannel[] = [];
    const group: PopulatedChannel[] = [];

    privateChannels.forEach((chan) => {
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
    console.error('Error in /structure:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

export default router;
