import { Router, Request, Response } from "express";
import { compareSync, hash } from "bcrypt";
import { verify, sign } from "jsonwebtoken";
import { IUser, IAuthenticatedUserRequest, IUserTokenPayload } from "../models/User";
import { IRefreshToken, IToken } from "../interfaces/tokenInterface";
import { generateAccessToken, saveRefreshToken } from "../utils/tokens";
import { verifyToken } from "../middlewares/verifyToken";
import { User } from "../models/User";
import { RefreshTokenModel } from "../models/tokenModel";


export const authController = Router();


authController.post("/token",  async (req: Request, res: Response) => {
    const refreshToken = req.cookies.refreshToken;
    if (!refreshToken) {
        res.status(401).send({ error: "No token provided" });
        return;
    }


    const token = await RefreshTokenModel.findOne({refreshToken: refreshToken});

    if (!token) {
        res.status(403).send({ error: "Invalid token" });
        return;
    }

    try {
        console.log(12);
        const user = verify(refreshToken, process.env.REFRESH_TOKEN as string) as IUserTokenPayload;
        console.log(user);
        const userPayload: IUserTokenPayload = {
            _id: user._id,
            username: user.username,
            email: user.email,
        };
        const newAccessToken = sign(userPayload, process.env.ACCESS_TOKEN as string, {
            expiresIn: "15m",
        });
        res.status(200).send({ accessToken: newAccessToken });
        return
    }
    catch (err) {
        RefreshTokenModel.findOneAndDelete({refreshToken})
        res.status(403).send({ error: "Token expired" });
        return;
    }


});

authController.post("/register" , async (req: Request, res: Response) => {

    console.log("Registering user");
    const newUser = req.body as IUser;

    if (!newUser.username || !newUser.password || !newUser.email)
    {
        res.status(400).send({error : "Missing parameters to user"});
        return;
    }


    const user = await User.findOne({username : newUser.username});

    if (user)
    {
        res.status(400).send({error : "User with this username already exists"});
        return;
    }

    const password = await hash(newUser.password, 10);

    const createdUser = new User({
        email: newUser.email,
        username: newUser.username,
        password: password
    })

    await createdUser.save();
    newUser.password = password;
    const { accessToken, refreshToken } = generateAccessToken(createdUser);
    await saveRefreshToken({refreshToken});
    res.cookie('refreshToken', refreshToken, {
        httpOnly: true,
        secure: true,
        sameSite: 'strict',
        maxAge: 7 * 24 * 60 * 60 * 1000
    })

    res.status(201).send({ accessToken });
});

authController.post("/login", async (req: Request, res: Response) => {
    const user = req.body as IUser;

    if (!user.username || !user.password)
    {
        res.status(400).send({error : "Missing parameters to user"});
        return;
    }


    const foundUser = await User.findOne({username: user.username})

    if (!foundUser)
    {
        res.status(400).send({error : "User with this username does not exist"});
        return;
    }


    if (!compareSync(user.password, foundUser.password)) {
        res.status(403).send({error : "Wrong password"});
        return;
    }


    user.password = foundUser.password;
    const tokens: IToken = generateAccessToken(foundUser)

    await saveRefreshToken(tokens as IRefreshToken)

    res.cookie('refreshToken', tokens.refreshToken, {
        httpOnly: true,
        secure: true,
        sameSite: 'strict',
        maxAge: 7 * 24 * 60 * 60 * 1000
    })

    res.status(200).send({"accessToken": tokens.accessToken});

});

authController.post("/logout", async (req: Request, res: Response) => {
    const refreshToken = req.cookies.refreshToken


    if (!refreshToken) {
        res.status(400).send({error : "No token provided"})
        return;
    }


    const token = await RefreshTokenModel.findOneAndDelete({refreshToken});

    if (!token) {
        res.status(400).send({error : "Invalid token"})
        return;
    }

    res.status(204).send({result: "Logged out"});
})

// for testing purposes
authController.get("/user", verifyToken, async (req: Request, res: Response) => {
    const user = (req as IAuthenticatedUserRequest).user;

    if (!user) {
        res.status(401).send({error : "No user found"});
        return;
    }

    res.status(200).send(user);
})

authController.get("/me", verifyToken, async (req: Request, res: Response) => {
    const user = (req as IAuthenticatedUserRequest).user;

    if (!user) {
        res.status(401).send({error : "No user found"});
        return;
    }

    res.status(200).send({id: user._id, username: user.username});
})