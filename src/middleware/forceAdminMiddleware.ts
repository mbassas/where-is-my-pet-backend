import { Response, NextFunction } from "express";
import { ApiRequest } from "..";

function forceAdminMiddleware(req: ApiRequest, res: Response, next: NextFunction) {
    if (!req.user) {
        res.sendStatus(401);
        return;
    }

    if(req.user.status === "Banned" || req.user.status === "Suspicious") {
        // 403: Forbidden
        res.sendStatus(403);
        return;
    }

    if(req.user.roles.includes("Admin")) {
        next();
        return;
    }

    res.sendStatus(403);
}

export default forceAdminMiddleware;
