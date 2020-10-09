import { Router, Response } from "express";
import { ApiRequest } from "..";
import forceLoginMiddleware from "../middleware/forceLoginMiddleware";
import notificationModel from "../Models/notificationModel";
import { Notification } from "../Entities/notification";
import CustomError, { ErrorType } from "../Models/customErrors";
import Joi from "@hapi/joi";
import { createValidator } from "express-joi-validation";

const notificationController = Router();
const validator = createValidator();

async function getNotifications(req: ApiRequest, res: Response) {
    try {
        const notifications = await notificationModel.GetNotifications(req.user.id);
        res.send(notifications);
    } catch (e) {
        console.error(e);
        if (e instanceof CustomError) {
            res.status(e.getHttpStatusCode()).send(e.getMessage());
        } else {
            res.sendStatus(500);
        }
    }
};

const updateNotificationParamsSchema = Joi.object({
    id: Joi.number().integer().required(),
});
const updateNotificationBodySchema = Joi.object({
    user_id: Joi.number().integer(), 
    message: Joi.string(), 
    link: Joi.string(), 
    read: Joi.boolean().required()
});
async function updateNotification(req: ApiRequest<Partial<Notification>>, res: Response) {
    try {
        const notificationId = parseInt(req.params.id);

        const originalNotification = await notificationModel.GetNotificationById(notificationId);
        if (req.user.id !== originalNotification.user_id) {
            throw new CustomError(ErrorType.UNAUTHORIZED);
        }

        await notificationModel.UpdateNotification({
            ...originalNotification,
            ...req.body
        });
        res.sendStatus(200);
    } catch (e) {
        console.error(e);
        if (e instanceof CustomError) {
            res.status(e.getHttpStatusCode()).send(e.getMessage());
        } else {
            res.sendStatus(500);
        }
    }
};

/**
 * Type definitions for this Controller
 * 
 * @typedef {object} Notification
 * @property {number} id.required
 * @property {number} user_id.required 
 * @property {string} message.required
 * @property {string} link.required
 * @property {boolean} read.required
 * @property {string} publication_date.required
 */

/**
* @typedef {undefined} Empty
*/

  /** 
 * @typedef {object} UpdateNotification
 * @property {boolean} read.required 
 */

/**
 * GET /notifications 
 * @summary Returns all notifications of a specific user
 * @tags Notification
 * @return {array<Notification>} 200 - Success
 * @return {string} 401 - Unauthorized
 * @security BearerToken
 */
notificationController.get("/", forceLoginMiddleware, getNotifications);

/**
 * PATCH /notifications/{id}
 * @summary Updates a notification
 * @tags Notification
 * @param {number} id.path
 * @param {UpdateNotification} request.body.required
 * @return {Empty} 200 - Success
 * @return {string} 404 - Not found
 * @return {string} 401 - Unauthorized
 * @security BearerToken
 */
notificationController.patch("/:id", forceLoginMiddleware, validator.body(updateNotificationBodySchema), validator.params(updateNotificationParamsSchema), updateNotification);

export default notificationController;