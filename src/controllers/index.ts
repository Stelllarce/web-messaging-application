import { Application, Router } from "express";
import { authController } from "./authController"

const apiController = Router();

export const connect = (app : Application): void => {
    
    apiController.use('/auth', authController) // api/auth/register

    // apiController.use('/fdsf', ...)
    // apiController.use('/fdsf', ...)
    // apiController.use('/fdsf', ...)

    app.use('/api', apiController);
}