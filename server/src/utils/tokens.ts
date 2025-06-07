import { sign } from "jsonwebtoken";

import { IUser, IUserTokenPayload } from "../models/User";
import { IRefreshToken } from "../interfaces/tokenInterface";

import { RefreshTokenModel } from "../models/tokenModel";

export const generateAccessToken = (user: IUser) => {

    const userPayload: IUserTokenPayload = {
        _id: user._id.toString(),
        username: user.username,
        email: user.email,
    };

    const accessToken = sign(userPayload , process.env.ACCESS_TOKEN as string, {
        expiresIn: "15m"
    });

    const refreshToken = sign(userPayload, process.env.REFRESH_TOKEN as string, {
        expiresIn: "7d"
    });

    return { accessToken, refreshToken };
}

export const saveRefreshToken = (refreshToken: IRefreshToken) => {

    const toAddToken = refreshToken.refreshToken;

    const token = new RefreshTokenModel({
        refreshToken: toAddToken
    });

    return token.save();
}