import { Router, Response } from "express";
import CustomError from "../Models/customErrors";
import breedModel from "../Models/breedModel";
import { ApiRequest } from "..";
import Joi from "@hapi/joi";
import { createValidator } from "express-joi-validation";

const validator = createValidator();
const breedController = Router();

const getBreedParamsSchema = Joi.object({
    species: Joi.string().required(), 
});
async function getBreed({ params }: ApiRequest, res: Response) {
    try {
        const breeds = await breedModel.GetBreedsBySpecies(params.species);
        res.send(breeds);
    } catch (e) {
        if (e instanceof CustomError) {
            res.status(e.getHttpStatusCode()).send(e.getMessage());
        } else {
            res.sendStatus(500);
        }
    }
}

/**
 * GET /breeds/{species}
 * @tags Breeds
 * @summary Gets all breeds of an specific species
 * @param {string} species.path
 * @return {array<string>} 200 - Success
 */
breedController.get("/:species", validator.params(getBreedParamsSchema), getBreed);

export default breedController;