const updateNotificationQuery =
    "UPDATE notifications SET read = $2 WHERE id = $1";

export default updateNotificationQuery;