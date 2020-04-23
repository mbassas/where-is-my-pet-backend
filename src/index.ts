import express from 'express';
import bodyParser from "body-parser";
import userController from './Controllers/userController';
import authMiddleware from './middleware/authMiddleware';
import cors from 'cors';
import Config from './config';
import animalController from './Controllers/animalController';
import { User } from './Entities/user';
import speciesController from './Controllers/speciesController';

const app = express();

export interface ApiRequest<T = any> extends express.Request {
    body: T;
    user?: User;
}

app.use(cors({ origin: Config.ALLOWED_ORIGINS }));
app.use(authMiddleware);
app.use(bodyParser.json());

app.get('/', (req, res) => {
    res.send('hello world');
});

app.listen(Config.PORT, () => {
    console.log(`App listening on http://localhost:${Config.PORT}`);
});

app.use("/users", userController);
app.use("/animals", animalController);
app.use("/species", speciesController);
