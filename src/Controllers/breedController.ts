import { Router, Request, Response } from "express";
import CustomError from "../Models/customErrors";
import breedModel from "../Models/breedModel";
import { ApiRequest } from "..";

const breedController = Router();

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

breedController.get("/:species", getBreed);

export default breedController;