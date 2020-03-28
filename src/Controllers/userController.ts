import { Router, Request, Response } from "express";
import { UserInput } from "../Entities/user";
import userModel from "../Models/userModel";
import CustomError from "../Models/customErrors";

const userController = Router();

interface ApiRequest<T> extends Request {
    body: T
}

async function signUp({ body }: ApiRequest<UserInput>, res: Response) {
    try {
        await userModel.CreateUser(body);

        res.send("OK");
    } catch (e) {
        console.error(e);
        res.send("NOOK");
    }
}

async function signIn({ body }: ApiRequest<{ username: string, password: string }>, res: Response) {
    try {
        await userModel.LogInUser(body.username, body.password);

        res.send("OK");
    } catch (e) {
        if (e instanceof CustomError) {
            res.status(e.getHttpStatusCode()).send(e.getMessage());
        } else {
            res.sendStatus(500);
        }
    }
}

userController.post("/sign-up", signUp);
userController.post("/sign-in", signIn);

export default userController;