import express from "express";
import dotenv from "dotenv";
import cookieParser from "cookie-parser";
import mongoose from 'mongoose';
import cors from 'cors';
import { connect } from "mongoose";
import { seedData } from './utils/database';
import { connect as connectAPI } from "./controllers/index";

dotenv.config();

const app = express();
app.use(express.json());
app.use(cookieParser());

connectAPI(app);

app.listen(process.env.PORT, async () => {
    // await connect(process.env.MONGO_URI as string);
    console.log("Server is ready on http://localhost:" + process.env.PORT);
});



dotenv.config();


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

mongoose.connection.once('open', async () => {
  //console.log('Стартиране на seedData...');
  try {
    await seedData(true);
    //console.log('SeedData е приключено успешно');
  } catch (err) {
    //console.error('Грешка при seedData:', err)
  }
});
