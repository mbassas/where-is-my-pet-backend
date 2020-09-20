const updateUserQuery =
    "UPDATE users SET status_id = (SELECT id FROM user_status WHERE value = $2) WHERE id = $1";

export default updateUserQuery;
