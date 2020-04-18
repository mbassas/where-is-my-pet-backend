import { Response, Router } from "express";
import animalModel from "../Models/animalModel";
import { AnimalInput } from "../Entities/animal";
import Joi from "@hapi/joi";
import { createValidator } from "express-joi-validation";
import CustomError from "../Models/customErrors";
import { ApiRequest } from "..";
import forceLoginMiddleware from "../middleware/forceLoginMiddleware";

const validator = createValidator();

const animalController = Router();

const createAnimalBodySchema = Joi.object({
    status: Joi.string().required(),
    species: Joi.string().required(),
    breed: Joi.string(),
    size: Joi.string(),
    color: Joi.string(),
    name: Joi.string(),
    gender: Joi.string(),
    age: Joi.number(),
    lat: Joi.number().required(),
    lng: Joi.number().required(),
    images: Joi.string().required(),
});
async function createAnimal(req: ApiRequest<AnimalInput>, res: Response) {
    try {
        await animalModel.CreateAnimal(req.user, req.body);
        res.sendStatus(204);
    } catch (e) {
        if (e instanceof CustomError) {
            res.status(e.getHttpStatusCode()).send(e.getMessage());
        } else {
            res.sendStatus(500);
        }
    }
}

animalController.post("/", forceLoginMiddleware, validator.body(createAnimalBodySchema), createAnimal);

export default animalController;