import { Response, Router } from "express";
import animalModel from "../Models/animalModel";
import { AnimalInput } from "../Entities/animal";
import Joi from "@hapi/joi";
import { createValidator } from "express-joi-validation";
import CustomError, { ErrorType } from "../Models/customErrors";
import { ApiRequest } from "..";
import forceLoginMiddleware from "../middleware/forceLoginMiddleware";
import multer from "multer";

const validator = createValidator();
const upload = multer({dest: "uploads/"});

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
    //images: Joi.string().required(),
});
async function createAnimal(req: ApiRequest<AnimalInput>, res: Response) {
    try {
        if (!Array.isArray(req.files) || req.files.length === 0) {
            throw new CustomError(ErrorType.ANIMAL_IMAGES_REQUIRED);
        }
        const animalId = await animalModel.CreateAnimal(req.user, req.body, req.files as any);
        res.sendStatus(204);
    } catch (e) {
        if (e instanceof CustomError) {
            res.status(e.getHttpStatusCode()).send(e.getMessage());
        } else {
            res.sendStatus(500);
        }
    }
};

async function getAnimalImage({params}: ApiRequest, res: Response) {
    try {
        const image = await animalModel.GetImage(
            parseInt(params.id),
            params.imageName
        );
        
        res
            .contentType("image/png")
            .send(image);

    } catch (e) {
        if (e instanceof CustomError) {
            res.status(e.getHttpStatusCode()).send(e.getMessage());
        } else {
            res.sendStatus(500);
        }
    }
}

async function getAnimalById({ params }: ApiRequest, res: Response) {
    try {
        const animal = await animalModel.GetAnimalById(parseInt(params.id));
        res.send(animal);
    } catch (e) {
        if (e instanceof CustomError) {
            res.status(e.getHttpStatusCode()).send(e.getMessage());
        } else {
            res.sendStatus(500);
        }
    }
};

animalController.post("/", forceLoginMiddleware, upload.array("images"), validator.body(createAnimalBodySchema), createAnimal);
animalController.get("/:id", getAnimalById);
animalController.get("/:id/:imageName.png", getAnimalImage);

export default animalController;