import { Router, Request, Response } from "express";
import { UserInput, User } from "../Entities/user";
import userModel from "../Models/userModel";
import CustomError from "../Models/customErrors";
import Joi from "@hapi/joi";
import { createValidator } from "express-joi-validation";

const validator = createValidator();

const userController = Router();

interface ApiRequest<T> extends Request {
    body: T;
    user?: User;
}

const signUpBodySchema = Joi.object({
    name: Joi.string().required(),
    surname: Joi.string().required(),
    email: Joi.string().email().required(),
    phone: Joi.string().required(),
    username: Joi.string().required(),
    password: Joi.string().required()
});

async function signUp(req: ApiRequest<UserInput>, res: Response) {
    try {
        const token = await userModel.CreateUser(req.body);

        res.json({ token });
    } catch (e) {
        if (e instanceof CustomError) {
            res.status(e.getHttpStatusCode()).send(e.getMessage());
        } else {
            res.sendStatus(500);
        }
    }
}

const signInBodySchema = Joi.object({
    username: Joi.string().required(),
    password: Joi.string().required()
});
async function signIn({ body }: ApiRequest<{ username: string, password: string }>, res: Response) {
    try {
        const jwt = await userModel.LogInUser(body.username, body.password);

        res.json({ token: jwt });
    } catch (e) {
        if (e instanceof CustomError) {
            res.status(e.getHttpStatusCode()).send(e.getMessage());
        } else {
            res.sendStatus(500);
        }
    }
}

const sendResetPasswordEmailBodySchema = Joi.object({
    usernameOrEmail: Joi.string().required(),
});
async function sendResetPasswordEmail({ body }: ApiRequest<{ usernameOrEmail: string }>, res: Response) {
    try {
        await userModel.SendResetPassword(body.usernameOrEmail);

        res.sendStatus(200);
    } catch (e) {
        if (e instanceof CustomError) {
            res.status(e.getHttpStatusCode()).send(e.getMessage());
        } else {
            console.error(e);
            res.sendStatus(500);
        }
    }
}

const resetPasswordBodySchema = Joi.object({
    token: Joi.string().required(),
    newPassword: Joi.string().required(),
});
async function resetPassword({ body }: ApiRequest<{ token: string, newPassword: string }>, res: Response) {
    try {
        await userModel.ResetPassword(body.token, body.newPassword);

        res.sendStatus(200);
    } catch (e) {
        if (e instanceof CustomError) {
            res.status(e.getHttpStatusCode()).send(e.getMessage());
        } else {
            res.sendStatus(500);
        }
    }
}

userController.post("/sign-up", validator.body(signUpBodySchema), signUp);
userController.post("/sign-in", validator.body(signInBodySchema), signIn);
userController.post("/reset-password-email", validator.body(sendResetPasswordEmailBodySchema), sendResetPasswordEmail);
userController.post("/reset-password", validator.body(resetPasswordBodySchema), resetPassword);

export default userController;