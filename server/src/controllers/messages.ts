import { Router, RequestHandler } from 'express';
import { findMessagesByTarget, findMessagesBetweenUsers, sendMessage } from '../utils/database';
import { User } from '../models/User';
import { Channel } from '../models/Channel';

const router = Router();

const getMessages: RequestHandler<{ id: string }> = async (req, res) => {
  try {
    const { id } = req.params;
    const me = await User.findOne({ isMe: true });

    if (!me) {
      res.status(500).json({ error: 'Me user not found' });
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

const postMessage: RequestHandler = async (req, res) => {
  try {
    const { fromId, toId, toModel, text } = req.body;

    if (!fromId || !toId || !toModel || !text) {
      res.status(400).json({ error: 'Missing fields' });
      return;
    }

    const message = await sendMessage(fromId, toId, toModel, text);
    res.status(201).json(message);
  } catch (error) {
    console.error('Error in POST /messages:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

router.get('/:id', getMessages);
router.post('/', postMessage);

export default router;
