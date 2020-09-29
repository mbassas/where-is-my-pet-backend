import { Response, Router } from "express";
import animalModel from "../Models/animalModel";
import { AnimalInput, Animal } from "../Entities/animal";
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
    location: Joi.string().required()
});
async function createAnimal(req: ApiRequest<AnimalInput>, res: Response) {
    try {
        if (!Array.isArray(req.files) || req.files.length === 0) {
            throw new CustomError(ErrorType.ANIMAL_IMAGES_REQUIRED);
        }
        const animalId = await animalModel.CreateAnimal(req.user, req.body, req.files as any, req.files[0].path);
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

const getAnimalImageParamsSchema = Joi.object({
    id: Joi.number().integer().required(),
    imageName: Joi.string().required(),
});
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

const getAnimalByIdParamsSchema = Joi.object({
    id: Joi.number().integer().required(),
});
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

const getAnimalsQuerySchema = Joi.object({
    start: Joi.number().integer(),
    count: Joi.number().integer(),
    species: Joi.string(),
    breed: Joi.string(),
    status: Joi.string(),
    lat: Joi.number(),
    lng: Joi.number(),
});
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

const updateAnimalParamsSchema = Joi.object({
    id: Joi.number().integer().required(),
});
const updateAnimalBodySchema = Joi.object({
    status: Joi.string(),
    species: Joi.string(),
    breed: Joi.string(),
    size: Joi.string(),
    color: Joi.string(),
    name: Joi.string(),
    gender: Joi.string(),
    age: Joi.number(),
    lat: Joi.number(),
    lng: Joi.number(),
    location: Joi.string(),
    recovered: Joi.boolean()
});
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

/**
 * Type definitions for this Controller
 * 
 * @typedef {object} Animal
 * @property {string} status.required - enum:LOST,FOUND
 * @property {string} species.required - enum:CAT,DOG,OTHER
 * @property {string} breed
 * @property {string} size - enum:SMALL,MEDIUM,BIG
 * @property {string} color
 * @property {string} name
 * @property {string} gender - enum:MALE,FEMALE
 * @property {number} age
 * @property {number} lat.required
 * @property {number} lng.required
 * @property {string} location.required
 * @property {string} images.required - The animal image - binary
 */

/** 
 * @typedef {object} CreateAnimalResponse
 * @property {number} id
 */

 /**
 * @typedef {undefined} Empty
 */

 /**
  * POST /animals
  * @summary Creates a new animal
  * @tags Animals
  * @param {Animal} request.body.required - The Animal - multipart/form-data
  * @return {CreateAnimalResponse} 201 - Created
  * @return {string} 400 - Images is required
  * @return {string} 401 - Unauthorized
  * @return {string} 403 - Forbidden
  */
animalController.post("/", forceLoginMiddleware, upload.array("images"), validator.body(createAnimalBodySchema), createAnimal);

/**
 * GET /animals/{id} 
 * @summary Returns a specific animal
 * @tags Animals
 * @param {number} id.path
 * @return {Animal} 200 - Success
 * @return {string} 404 - Not found
 */
animalController.get("/:id", validator.params(getAnimalByIdParamsSchema), getAnimalById);

/**
 * PATCH /animals/{id} 
 * @summary Updates an animal
 * @tags Animals
 * @param {number} id.path
 * @param {Animal} request.body.required
 * @return {Empty} 200 - Success
 * @return {string} 404 - Not found
 * @return {string} 401 - Unauthorized
 */
animalController.patch("/:id", forceLoginMiddleware, validator.params(updateAnimalParamsSchema), validator.body(updateAnimalBodySchema), updateAnimal);

/**
 * GET /animals/{id}/{imageName}.png
 * @summary Gets an animal image
 * @tags Animals
 * @param {number} id.path
 * @param {string} imageName.path
 * @return {string} 200 - Success - image/png
 * @return {string} 404 - Not Found
 */
animalController.get("/:id/:imageName.png", validator.params(getAnimalImageParamsSchema), getAnimalImage);

/**
 * GET /animals
 * @tags Animals
 * @param {integer} start.query
 * @param {integer} count.query
 * @param {string} species.query - enum:CAT,DOG,OTHER
 * @param {string} breed.query
 * @param {string} status.query - enum:LOST,FOUND
 * @param {number} lat.query
 * @param {number} lng.query
 * @return {array<Animal>} 200 - Success
 */
animalController.get("/", validator.query(getAnimalsQuerySchema), getAnimals);

export default animalController;