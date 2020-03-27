import express, { Request } from 'express';
import bodyParser from "body-parser";
import insertUserQuery from './db/queries/users/insert_user';
import { runQuery } from './db/database';

const app = express();

app.use(bodyParser.json());

app.get('/', (req, res) => {
    res.send('hello world');
});

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
    console.log(`App listening on http://localhost:${PORT}`);
});

interface ApiRequest<T> extends Request {
    body: T
}

interface User {
    name: string;
    surname: string;
    email: string;
    phone: string;
    username: string;
    password: string;
}

app.post('/users/newUser', async ({ body }: ApiRequest<User>, res) => {
    try {
        const result = await runQuery(
            insertUserQuery,
            {
                $name: body.name,
                $surname: body.surname,
                $email: body.email,
                $phone: body.phone,
                $username: body.username,
                $password: body.password
            }
        );

        res.send("OK");
    } catch (e) {
        console.error(e);
        res.send("NOOK");
    }
})

