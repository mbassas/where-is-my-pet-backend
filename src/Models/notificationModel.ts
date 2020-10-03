import fs from "fs";
import { runQuery } from "../db/database";
import path from "path";
import { Notification, NotificationInput } from "../Entities/notification";
import insertNotificationQuery from "../db/queries/notifications/insert_notification";
import CustomError, { ErrorType } from "./customErrors";
import updateNotificationQuery from "../db/queries/notifications/update_notification";

const getNotificationById = fs.readFileSync(path.resolve(__dirname, "../db/queries/notifications/get_notification_by_id.sql"), "utf8");
const getNotificationsByUserId = fs.readFileSync(path.resolve(__dirname, "../db/queries/notifications/get_notifications_by_user_id.sql"), "utf8");

class notificationModel {

    public async GetNotifications(userId: number): Promise<Notification[]> {

        const queryResult = await runQuery<Notification>(getNotificationsByUserId, [userId]);

        return queryResult.rows;
    }

    public async InsertNotification(notification: NotificationInput): Promise<void> {
        try {
            await runQuery<Notification>(
                insertNotificationQuery,
                [
                    notification.user_id,
                    notification.message,
                    notification.link,
                    notification.read
                ]
            );
        } catch (e) {
            console.error(e);
            throw e;
        }
    }

    public async GetNotificationById(notificationId: number): Promise<Notification> {

        const queryResult = await runQuery<Notification>(getNotificationById, [notificationId]);

        if (queryResult.rowCount !== 1) {
            throw new CustomError(ErrorType.NOT_FOUND);
        }

        return queryResult.rows[0];
    }

    public async UpdateNotification(params: Partial<Notification>) {
        try {
            await runQuery<Notification>(
                updateNotificationQuery,
                [
                    params.id,
                    params.read
                ]
            );
        } catch (e) {
            console.error(e);
            throw e;
        }
    }
};

export default new notificationModel();