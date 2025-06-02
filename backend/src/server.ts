import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import dotenv from 'dotenv';
import structureRoutes from './controllers/structure';
import messageRoutes from './controllers/messages';
import userRoutes from './controllers/users';
import channelRoutes from './controllers/channels';


import { seedData } from './utils/database';

dotenv.config();

const app = express();

const port = process.env.PORT || 3000;
const mongoUri = process.env.MONGO_URI;

if (!mongoUri) {
  console.error('MONGO_URI is not set in the .env file!');
  process.exit(1);
}

mongoose.connect(mongoUri)
  .then(() => console.log('Connected with MongoDB'))
  .catch((err) => {
    console.error('Error while connecting MongoDB:', err);
    process.exit(1);
  });


  app.use(cors());
  app.use(express.json());
  app.use((req, res, next) => {
  console.log(`[${req.method}] ${req.url}`);
  next();
});

app.use('/structure', structureRoutes);
app.use('/messages', messageRoutes);
app.use('/users', userRoutes);
app.use('/channels', channelRoutes);

//Тестов route
app.get('/', (req, res) => {
  res.send('The server is working!');
});



mongoose.connection.once('open', async () => {
  try {
    await seedData(true);
  } catch (err) {
    //console.error('Грешка при seedData:', err);
  }
});

//Стартиране на сървъра
app.listen(port, () => {
  console.log(`Сървърът слуша на http://localhost:${port}`);
});
