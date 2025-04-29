import mongoose from 'mongoose';
import { User } from '../models/User';
import { Channel } from '../models/Channel';
import { Message } from '../models/Message';
import bcrypt from 'bcrypt';

//Създаване на потребител
export async function createUser(username: string, password: string, isMe = false) {
  const hashedPassword = await bcrypt.hash(password, 10);
  const user = new User({ username, password: hashedPassword, isMe });
  await user.save();
  return user;
}

//Създаване на канал
export async function createChannel(
  name: string,
  type: 'public' | 'private',
  users: string[] = [],
  chatType?: 'group' | 'people',
  members: mongoose.Types.ObjectId[] = []
) {
  const channel = new Channel({
    name,
    type,
    users,
    chatType: type === 'private' ? chatType : undefined,
    members,
  });
  await channel.save();
  return channel;
}

//Създаване на съобщение
export async function sendMessage(
  fromId: string,
  toId: string,
  toModel: 'User' | 'Channel',
  text: string
) {
  const message = new Message({
    from: fromId,
    to: toId,
    toModel,
    text,
  });
  await message.save();
  return message;
}

//Намиране на потребител по ID
export async function findUserById(id: string) {
  return await User.findById(id);
}

//Намиране на канал по ID
export async function findChannelById(id: string) {
  return await Channel.findById(id);
}

//Намиране на съобщения по ID на канал или човек
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

//Намиране на съобщения между двама потребители
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

//Зареждане на начални данни с FORCE
export async function seedData(force = false) {
  const usersCount = await User.countDocuments();
  const channelsCount = await Channel.countDocuments();

  if (!force && (usersCount > 0 || channelsCount > 0)) {
    console.log('Данните вече съществуват, пропускаме seed.');
    return;
  }

  if (force) {
    await User.deleteMany({});
    await Channel.deleteMany({});
    await Message.deleteMany({});
    // console.log('Чисти базата от данни');
  }

  console.log('Зареждане на началните данни...');

  const me = await createUser('Me', 'password123', true);
  const alice = await createUser('Alice', 'alicepass');
  const bob = await createUser('Bob', 'bobpass');
  const charlie = await createUser('Charlie', 'charliepass');

  // Създаваме private чатове Me <-> друг
  const users = [alice, bob, charlie];
  for (const user of users) {
    await createChannel(
      `Chat: Me with ${user.username}`,
      'private',
      [me._id.toString(), user._id.toString()],
      'people',
      [me._id, user._id]
    );
  }

  //Създаваме публични канали
  await createChannel('General', 'public', ['*']);
  await createChannel('Tech Talk', 'public', ['*']);

  //Създаваме частен групов канал
  await createChannel(
    'Dev Team',
    'private',
    [me._id.toString(), bob._id.toString(), charlie._id.toString()],
    'group'
  );

  //Изпращаме примерни съобщения в публични канали
  const generalChannel = await Channel.findOne({ name: 'General' });
  const techTalkChannel = await Channel.findOne({ name: 'Tech Talk' });
  const devTeamChannel = await Channel.findOne({ name: 'Dev Team' });

  if (generalChannel) {
    await sendMessage(alice.id, generalChannel.id, 'Channel', 'Hello everyone!');
    await sendMessage(bob.id, generalChannel.id, 'Channel', 'Hi Alice!');
  }

  if (techTalkChannel) {
    await sendMessage(charlie.id, techTalkChannel.id, 'Channel', 'New tech is amazing!');
  }

  if (devTeamChannel) {
    await sendMessage(me.id, devTeamChannel.id, 'Channel', 'Private dev team discussion.');
  }

  //Изпращаме лични съобщения между Me и потребителите
  await sendMessage(me.id, alice.id, 'User', 'Hi Alice, how are you?');
  await sendMessage(alice.id, me.id, 'User', 'Hi! I\'m good, thanks.');

  await sendMessage(me.id, bob.id, 'User', 'Hey Bob, ready for the meeting?');
  await sendMessage(bob.id, me.id, 'User', 'Yes, let\'s do it at 3 PM.');

  await sendMessage(me.id, charlie.id, 'User', 'Charlie, can you review my code?');
  await sendMessage(charlie.id, me.id, 'User', 'Sure, send it over.');

  console.log('Началните данни са заредени успешно.');
}
