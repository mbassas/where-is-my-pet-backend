import { Response, Router } from "express";
import animalModel from "../Models/animalModel";
import { AnimalInput, Animal } from "../Entities/animal";
import Joi from "@hapi/joi";
import { createValidator } from "express-joi-validation";
import CustomError, { ErrorType } from "../Models/customErrors";
import { ApiRequest } from "..";
import forceLoginMiddleware from "../middleware/forceLoginMiddleware";
import multer from "multer";
import { runQuery } from "../db/database";
import getUserByUsernameOrEmailQuery from "../db/queries/users/get_user_by_username_or_email";
import { User } from "../Entities/user";

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
    location: Joi.string().required()
});
async function createAnimal(req: ApiRequest<AnimalInput>, res: Response) {
    try {
        if (!Array.isArray(req.files) || req.files.length === 0) {
            throw new CustomError(ErrorType.ANIMAL_IMAGES_REQUIRED);
        }
        const animalId = await animalModel.CreateAnimal(req.user, req.body, req.files as any);
        res.status(201).send({id: animalId});
    } catch (e) {
        console.error(e);
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
        
        // the images are stored in cache for one year
        res
            .header("Cache-Control", "max-age=31536000")
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

async function getAnimals({ query }: ApiRequest, res: Response) {
    const start = parseInt(query.start);
    const count = parseInt(query.count);
    const species = query.species;
    const breed = query.breed;
    const status = query.status;
    const lat = parseFloat(query.lat);
    const lng = parseFloat(query.lng);

    try {
        const animals = await animalModel.GetAnimals({
            start: start || undefined, 
            count: count || undefined,
            species: species || undefined,
            breed: breed || undefined,
            lat: lat || undefined,
            lng: lng || undefined,
            status: status || undefined
        });
        res.send(animals);
    } catch (e) {
        if (e instanceof CustomError) {
            res.status(e.getHttpStatusCode()).send(e.getMessage());
        } else {
            console.error(e);
            res.sendStatus(500);
        }
    }
};

async function updateAnimal (req: ApiRequest<Partial<Animal>>, res: Response) {
    try {
        const animal = await animalModel.GetAnimalById(parseInt(req.params.id));

        if (animal.user_id !== req.user.id) {
            throw new CustomError(ErrorType.UNAUTHORIZED);
        }
        
        await animalModel.UpdateAnimal(parseInt(req.params.id), req.body); 
        res.sendStatus(200);
       
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
animalController.patch("/:id", forceLoginMiddleware, updateAnimal);
animalController.get("/:id/:imageName.png", getAnimalImage);
animalController.get("/", getAnimals);


export default animalController;