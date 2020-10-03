
const insertNotificationQuery = `
INSERT INTO notifications (
    user_id,
    message,
    link,
    read
) 
VALUES (
    $1,
    $2, 
    $3,
    $4
)
RETURNING *
`
export default insertNotificationQuery;
