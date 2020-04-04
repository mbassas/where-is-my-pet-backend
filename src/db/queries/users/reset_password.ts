const resetPasswordQuery =
    "UPDATE users SET password = $2 WHERE id = $1";

export default resetPasswordQuery;