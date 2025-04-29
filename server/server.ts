import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import dotenv from 'dotenv';
import structureRoutes from './routes/structure';
import messageRoutes from './routes/messages';
import userRoutes from './routes/users';
import channelRoutes from './routes/channels';


import { seedData } from './utils/database';

//.env
dotenv.config();

const app = express();

const port = process.env.PORT || 3000;
const mongoUri = process.env.MONGO_URI;

if (!mongoUri) {
  console.error('MONGO_URI не е зададен в .env файла!');
  process.exit(1);
}

console.log('Опит за свързване към MongoDB на адрес:', mongoUri);

//Свързване към MongoDB
mongoose.connect(mongoUri)
  .then(() => console.log('Успешно свързване с MongoDB'))
  .catch((err) => {
    console.error('Грешка при свързване с MongoDB:', err);
    process.exit(1);
  });


  app.use(cors());
  app.use(express.json());
  app.use((req, res, next) => {
  console.log(`[${req.method}] ${req.url}`);
  next();
});

//routes
app.use('/structure', structureRoutes);
app.use('/messages', messageRoutes);
app.use('/users', userRoutes);
app.use('/channels', channelRoutes);

//Тестов route
app.get('/', (req, res) => {
  res.send('Сървърът работи!');
});



mongoose.connection.once('open', async () => {
  console.log('Стартиране на seedData...');
  try {
    await seedData(true);
    console.log('SeedData е приключено успешно');
  } catch (err) {
    console.error('Грешка при seedData:', err);
  }
});

//Стартиране на сървъра
app.listen(port, () => {
  console.log(`Сървърът слуша на http://localhost:${port}`);
});
