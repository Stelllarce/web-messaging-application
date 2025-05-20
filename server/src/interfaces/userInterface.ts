import { Request } from "express";

export interface IUser {
    id: number;
	username: string;
	password: string;
}

export interface IAuthenticatedUserRequest extends Request {
    user: IUser;
}

