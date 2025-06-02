import { Router, Request, Response } from 'express';
import { findMessagesByTarget, findMessagesBetweenUsers, sendMessage } from '../utils/database';
import { User } from '../models/User';
import { Channel } from '../models/Channel';
import mongoose from 'mongoose';

const router = Router();

// GET /messages/:id – Взима съобщения за канал или разговор между двама потребители
const getMessages = async (req: Request<{ id: string }>, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    const me = await User.findOne({ isMe: true });
    if (!me || !(me._id instanceof mongoose.Types.ObjectId)) {
      res.status(500).json({ error: 'Me user not found or invalid ID' });
      return;
    }

    const channel = await Channel.findById(id);
    if (channel) {
      const messages = await findMessagesByTarget(id);
      res.json(messages);
      return;
    }

    const user = await User.findById(id);
    if (user) {
      const messages = await findMessagesBetweenUsers(me._id.toString(), id);
      res.json(messages);
      return;
    }

    res.status(404).json({ error: 'Not found' });
  } catch (error) {
    console.error('Error in GET /messages/:id:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

// POST /messages – Изпраща съобщение до потребител или канал
const postMessage = async (req: Request, res: Response): Promise<void> => {
  try {
    const { fromId, toId, text } = req.body;

    if (!fromId || !toId || !text) {
      res.status(400).json({ error: 'Missing fields' });
      return;
    }

    const toUser = await User.findById(toId);
    const toChannel = await Channel.findById(toId);

    if (!toUser && !toChannel) {
      res.status(404).json({ error: 'Target user or channel not found' });
      return;
    }

    const message = await sendMessage(fromId, toId, text);
    res.status(201).json(message);
  } catch (error) {
    console.error('Error in POST /messages:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

router.get('/:id', getMessages);
router.post('/', postMessage);

export default router;
