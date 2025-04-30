import { Router } from "express";
import { hash } from "bcrypt";
import { verify, sign } from "jsonwebtoken";
import { generateAccessToken, tokens } from "../utils/tokens";
export const authController = Router();
const users = [];
let myId = users.length;
authController.post("/token", async (req, res) => {
    const refreshToken = req.body.token;
    if (!refreshToken) {
        res.status(401).send({ error: "No token provided" });
        return;
    }
    const token = tokens.find((val) => val === refreshToken);
    if (!token) {
        res.status(403).send({ error: "Invalid token" });
        return;
    }
    try {
        const user = verify(refreshToken, process.env.JWT_SECRET);
        const newAccessToken = sign(user, process.env.ACCESS_TOKEN, {
            expiresIn: "15m",
        });
        res.status(200).send({ accessToken: newAccessToken });
    }
    catch (err) {
        res.status(403).send({ error: "Invalid token" });
        return;
    }
});
authController.post("/register", async (req, res) => {
    const newUser = req.body;
    if (!newUser.id || !newUser.username || newUser.password) {
        res.status(400).send({ error: "Missing parameters to user" });
        return;
    }
    const user = users.find((val) => val.username === newUser.username);
    if (user) {
        res.status(400).send({ error: "User with this username already exists" });
        return;
    }
    const password = await hash(newUser.password, 10);
    const userToAdd = {
        id: ++myId,
        username: newUser.username,
        password: password
    };
    users.push(userToAdd);
    const { accessToken, refreshToken } = generateAccessToken(userToAdd);
    res.status(201).send({ accessToken, refreshToken });
});
