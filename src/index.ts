import express from 'express';
import bodyParser from "body-parser";
import userController from './Controllers/userController';

const app = express();

app.use(bodyParser.json());

app.get('/', (req, res) => {
    res.send('hello world');
});

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
    console.log(`App listening on http://localhost:${PORT}`);
});

app.use("/users", userController);
