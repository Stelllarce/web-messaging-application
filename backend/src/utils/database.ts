import mongoose from 'mongoose';
import { User } from '../models/User';
import { Channel } from '../models/Channel';
import { Message } from '../models/Message';
import bcrypt from 'bcrypt';

export async function createUser(username: string, password: string, isMe = false) {
  const hashedPassword = await bcrypt.hash(password, 10);
  const user = new User({ username, password: hashedPassword, isMe });
  await user.save();
  return user;
}

export async function createChannel(
  name: string,
  type: 'public' | 'private',
  members: mongoose.Types.ObjectId[] = []
) {
  if (type === 'private' && members.length === 0) {
    throw new Error('Private channel must have members.');
  }

  const channel = new Channel({
    name,
    type,
    members: type === 'private' ? members : [],
    messages: [],
  });

  await channel.save();
  return channel;
}

export async function sendMessage(fromId: string, toId: string, text: string) {
  const message = new Message({ from: fromId, to: toId, text });
  await message.save();
  return message;
}


export async function findUserById(id: string) {
  return await User.findById(id);
}

export async function findChannelById(id: string) {
  return await Channel.findById(id);
}

export async function findMessagesByTarget(id: string) {
  if (!mongoose.Types.ObjectId.isValid(id)) {
    throw new Error('Invalid ID format');
  }

  const objectId = new mongoose.Types.ObjectId(id);

  const messages = await Message.find({
    $or: [{ to: objectId }, { from: objectId }],
  })
    .populate('from', 'username')
    .populate('to', 'username name')
    .sort({ timestamp: 1 });

  return messages;
}

export async function findMessagesBetweenUsers(user1Id: string, user2Id: string) {
  const messages = await Message.find({
    $or: [
      { from: user1Id, to: user2Id },
      { from: user2Id, to: user1Id },
    ],
  })
    .populate('from', 'username')
    .populate('to', 'username name')
    .sort({ timestamp: 1 });

  return messages;
}

export async function seedData(force = false) {
  const usersCount = await User.countDocuments();
  const channelsCount = await Channel.countDocuments();

  if (!force && (usersCount > 0 || channelsCount > 0)) {
    return;
  }

  if (force) {
    await User.deleteMany({});
    await Channel.deleteMany({});
    await Message.deleteMany({});
  }
}
