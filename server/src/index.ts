import express from "express";
import dotenv from "dotenv";
import cookieParser from "cookie-parser";
import { connect } from "mongoose";

import { connect as connectAPI } from "./controllers/index";

dotenv.config();

const app = express();
app.use(express.json());
app.use(cookieParser());

connectAPI(app);

app.listen(process.env.PORT, async () => {
    await connect(process.env.MONGO_URI as string);
    console.log("Server is ready on http://localhost:" + process.env.PORT);
}); 