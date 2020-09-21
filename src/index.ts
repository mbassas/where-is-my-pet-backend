import express from 'express';
import bodyParser from "body-parser";
import userController from './Controllers/userController';
import authMiddleware from './middleware/authMiddleware';
import cors from 'cors';
import Config from './config';
import animalController from './Controllers/animalController';
import { User } from './Entities/user';
import speciesController from './Controllers/speciesController';
import breedController from './Controllers/breedController';
import imageRecognitionController from './Controllers/imageRecognitionController';
import compression from 'compression';
import expressJSDocSwagger from 'express-jsdoc-swagger';
import swaggerConfig from './swagger.config';

const app = express();
expressJSDocSwagger(app)(swaggerConfig);

export interface ApiRequest<T = any> extends express.Request {
    body: T;
    user?: User;
}

//add gzip compression
app.use(compression());

app.use(cors({ origin: Config.ALLOWED_ORIGINS }));
app.use(authMiddleware);
app.use(bodyParser.json());

app.get('/', (req, res) => {
    res.send(`<h1>Where is my pet backend</h1><p>See docs <a href="/api-docs">here</a>.`);
});

app.listen(Config.PORT, () => {
    console.log(`App listening on http://localhost:${Config.PORT}`);
});

app.use("/users", userController);
app.use("/animals", animalController);
app.use("/species", speciesController);
app.use("/breeds", breedController);
app.use("/image-recognition", imageRecognitionController);
