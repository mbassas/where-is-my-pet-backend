import { Router, Request, Response } from "express";
import CustomError from "../Models/customErrors";
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

/**
 * GET /species
 * @tags Species
 * @summary Gets all species
 * @return {array<string>} 200 - Success
 */
speciesController.get("/", getSpecies);

export default speciesController;
