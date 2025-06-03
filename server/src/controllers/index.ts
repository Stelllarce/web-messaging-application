import { Application, Router } from "express";
import { authController } from "./authController"
import messages from "./messages";
import structure from "./structure";
import users from "./users";
import channels from "./channels";

const apiController = Router();

export const connect = (app : Application): void => {
    
    apiController.use('/auth', authController) // api/auth/register
    
    apiController.use('/messages', messages);
    apiController.use('/structure', structure);
    apiController.use('/users', users);
    apiController.use('/channels', channels);

    // apiController.use('/fdsf', ...)
    // apiController.use('/fdsf', ...)
    // apiController.use('/fdsf', ...)

    app.use('/api', apiController);
    
}