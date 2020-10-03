import { Response, NextFunction } from "express";
import { ApiRequest } from "..";

function checkBannedMiddleware(req: ApiRequest, res: Response, next: NextFunction) {
    if(req.user.status === "Banned" || req.user.status === "Suspicious") {
        // 403: Forbidden
        res.sendStatus(403);
        return;
    }

    next();
}

export default checkBannedMiddleware;
