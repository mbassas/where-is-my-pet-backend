
const insertUserQuery = `
    INSERT INTO users (
        name,
        surname,
        email,
        phone,
        username,
        password
    ) 
    VALUES (
        $1,
        $2, 
        $3,
        $4, 
        $5, 
        $6
    );
`
export default insertUserQuery;
