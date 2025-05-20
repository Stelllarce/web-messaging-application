import { sign } from "jsonwebtoken";

import { IUser } from "../interfaces/userInterface";
import { IToken, IRefreshToken } from "../interfaces/tokenInterface";

import { RefreshTokenModel } from "../models/tokenModel";

export const generateAccessToken = (user: IUser) => {
    const accessToken = sign(user, process.env.ACCESS_TOKEN as string, {
        expiresIn: "15m"
    });

    const refreshToken = sign(user, process.env.REFRESH_TOKEN as string, {
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