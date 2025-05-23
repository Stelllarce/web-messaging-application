import { Router } from 'express';
import { User } from '../models/User';


const router = Router();

router.get('/', async (req, res) => {
  try {
    const users = await User.find({}, 'username isMe');
    res.json(users);
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

export default router;
