
const insertUserQuery = `
    INSERT INTO users (
        name,
        surname,
        email,
        email_hash,
        phone,
        username,
        username_hash,
        password
    ) 
    VALUES (
        $1,
        $2, 
        $3,
        $4, 
        $5, 
        $6,
        $7,
        $8
    )
    RETURNING *
`
export default insertUserQuery;
