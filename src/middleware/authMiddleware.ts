import { Request, Response, NextFunction } from "express";
import userModel from "../Models/userModel";

async function authMiddleware(req: Request, res: Response, next: NextFunction) {
    const token = req.headers['authorization'];
    if (!token || !token.startsWith("Bearer ")) {
        next();
        return;
    }

    try {
        const user = await userModel.GetUserFromToken(token.replace("Bearer ", ""));
        //@ts-ignore
        req.user = user;
    } catch (e) {
        //keep on without user
    } finally {
        next();
    }
}

export default authMiddleware;
