import { Router, Request, Response } from "express";
import CustomError from "../Models/customErrors";
import animalModel from "../Models/animalModel";
import speciesModel from "../Models/speciesModel";

const speciesController = Router();

async function getSpecies(req: Request, res: Response) {
    try {
        const species = await speciesModel.GetAllSpecies();
        res.send(species);
    } catch(e) {
        if (e instanceof CustomError) {
            res.status(e.getHttpStatusCode()).send(e.getMessage());
        } else {
            res.sendStatus(500);
        }
    }
}

speciesController.get("/", getSpecies);

export default speciesController;
