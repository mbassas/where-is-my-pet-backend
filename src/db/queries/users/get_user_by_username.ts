const getUserByUsernameQuery = "SELECT * FROM users WHERE username_hash = $1";

export default getUserByUsernameQuery;