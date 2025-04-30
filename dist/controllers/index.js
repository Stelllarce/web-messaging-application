import { Router } from "express";
import { authController } from "./authController";
const apiController = Router();
export const connect = (app) => {
    apiController.use('/auth', authController);
    // apiController.use('/fdsf', ...)
    // apiController.use('/fdsf', ...)
    // apiController.use('/fdsf', ...)
    app.use('/api', apiController);
};
