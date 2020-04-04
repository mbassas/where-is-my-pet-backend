const getUserByUsernameOrEmailQuery = "SELECT * FROM users WHERE email_hash = $1 OR username_hash = $1";

export default getUserByUsernameOrEmailQuery;