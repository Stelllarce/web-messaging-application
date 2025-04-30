import { sign, verify } from "jsonwebtoken";
import { NextFunction, Request, Response } from "express";
import { IAuthenticatedUserRequest, IUser } from "../interfaces/userInterface";


export const verifyToken = async (req: Request, res: Response, next: NextFunction) => {
    const authHeader = req.headers.authorization;
    const token = authHeader && authHeader.split(" ")[1];

    if (!token) {
        res.status(401).send({ error: "No token provided" });
        return;
    }

    try {
        const user = verify(token, process.env.JWT_SECRET as string) as IUser;
        (req as IAuthenticatedUserRequest).user = user;
    }
    catch (err) {
        res.status(403).send({ error: "Invalid token" });
        return;
    }


    next();
}