import { Application, Router } from "express";
import { authController } from "./authController"
import { channelController } from "./channelController"

const apiController = Router();

export const connect = (app : Application): void => {

    apiController.use('/auth', authController) // api/auth/
    apiController.use('/channels', channelController) // api/channels/

    app.use('/api', apiController);

}