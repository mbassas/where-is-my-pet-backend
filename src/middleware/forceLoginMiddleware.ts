import { Response, NextFunction } from "express";
import { ApiRequest } from "..";

function forceLoginMiddleware(req: ApiRequest, res: Response, next: NextFunction) {
    if (!req.user) {
        // 401: Unauthorized
        res.sendStatus(401);
        return;
    }

    if(req.user.status === "Banned" || req.user.status === "Suspicious") {
        // 403: Forbidden
        res.sendStatus(403);
        return;
    }

    next();
}

export default forceLoginMiddleware;
