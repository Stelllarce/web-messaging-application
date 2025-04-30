import { sign } from "jsonwebtoken";
export const tokens = [];
export const generateAccessToken = (user) => {
    const accessToken = sign(user, process.env.ACCESS_TOKEN, {
        expiresIn: "15m",
    });
    const refreshToken = sign(user, process.env.REFRES_TOKEN);
    tokens.push({ refreshToken });
    return { accessToken, refreshToken };
};
