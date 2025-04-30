import express from "express";
import dotenv from "dotenv";
import { connect } from "./controllers/index";
dotenv.config();
const app = express();
app.use(express.json());
connect(app);
app.listen(process.env.PORT, () => {
    console.log("Server is ready on http//localhost:" + process.env.PORT);
});
