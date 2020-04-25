import { Response, NextFunction } from "express";
import { ApiRequest } from "..";

function forceLoginMiddleware(req: ApiRequest, res: Response, next: NextFunction) {
    if (!req.user) {
        res.sendStatus(401);
        return;
    }

    next();
}

export default forceLoginMiddleware;
