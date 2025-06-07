import { verify } from "jsonwebtoken";
import { NextFunction, Request, Response } from "express";
import { IAuthenticatedUserRequest, IUserTokenPayload } from "../models/User";


export const verifyToken = async (req: Request, res: Response, next: NextFunction) => {
    const authHeader = req.headers.authorization;
	const token = authHeader && authHeader.split(' ').pop();

    if (!token) {
        res.status(401).send({ error: "No token provided" });
        return;
    }

    try {
        const user = verify(token, process.env.ACCESS_TOKEN as string) as IUserTokenPayload;
        (req as IAuthenticatedUserRequest).user = user;
    }
    catch (err) {
        res.status(403).send({ error: "Invalid token" });
        return;
    }


    next();
}