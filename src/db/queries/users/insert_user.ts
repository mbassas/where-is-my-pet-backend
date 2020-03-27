
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
        $name,
        $surname, 
        $email,
        $phone, 
        $username, 
        $password
    );
`
export default insertUserQuery;
