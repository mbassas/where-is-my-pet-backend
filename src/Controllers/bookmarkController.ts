import { Response, Router } from "express";
import { ApiRequest } from "..";
import bookmarkModel from "../Models/bookmarkModel";
import CustomError from "../Models/customErrors";
import checkBannedMiddleware from "../middleware/checkBannedMiddleware";
import forceLoginMiddleware from "../middleware/forceLoginMiddleware";
import Joi from "@hapi/joi";
import { createValidator } from "express-joi-validation";

const validator = createValidator();
const bookmarkController = Router();

const createBookmarkParamsSchema = Joi.object({
    animalId: Joi.number().integer().required(),
});
async function createBookmark (req: ApiRequest, res: Response) {
    try {
        await bookmarkModel.CreateBookmark(req.user.id, parseInt(req.params.animalId));
        res.status(200).send();
    } catch (e) {
        console.error(e);
        if (e instanceof CustomError) {
            res.status(e.getHttpStatusCode()).send(e.getMessage());
        } else {
            res.sendStatus(500);
        }
    }
};

const deleteBookmarkParamsSchema = Joi.object({
    animalId: Joi.number().integer().required(),
});
async function deleteBookmark (req: ApiRequest, res: Response) {
    try {
        await bookmarkModel.DeleteBookmark(req.user.id, parseInt(req.params.animalId));
        res.status(200).send();
    } catch (e) {
        console.error(e);
        if (e instanceof CustomError) {
            res.status(e.getHttpStatusCode()).send(e.getMessage());
        } else {
            res.sendStatus(500);
        }
    }
};


async function getAnimalBookmarks(req: ApiRequest, res: Response) {
    try {
        const animals = await bookmarkModel.GetAnimalsByUserId(req.user.id);
        res.send(animals);
    } catch (e) {
        console.error(e);
        if (e instanceof CustomError) {
            res.status(e.getHttpStatusCode()).send(e.getMessage());
        } else {
            res.sendStatus(500);
        }
    }
}

/**
 * Type definitions for this Controller
 * 
 * @typedef {object} Bookmark
 * @property {number} user_id.required 
 */

 /**
 * @typedef {undefined} Empty
 */

/**
 * POST /bookmarks/{animalId} 
 * @summary Creates a bookmark
 * @tags Bookmarks
 * @param {number} animalId.path
 * @return {Empty} 200 - Success
 * @return {string} 401 - Unauthorized
 * @return {string} 403 - Forbidden
 * @security BearerToken
 */
bookmarkController.post("/:animalId", forceLoginMiddleware, checkBannedMiddleware, validator.params(createBookmarkParamsSchema), createBookmark);

/**
 * DELETE /bookmarks/{animalId} 
 * @summary Deletes a bookmark
 * @tags Bookmarks
 * @param {number} animalId.path
 * @return {Empty} 200 - Success
 * @return {string} 401 - Unauthorized
 * @return {string} 403 - Forbidden
 * @security BearerToken
 */
bookmarkController.delete("/:animalId", forceLoginMiddleware, checkBannedMiddleware, validator.params(deleteBookmarkParamsSchema), deleteBookmark);

/**
 * GET /bookmarks
 * @summary Get all bookmarked animals for the current user
 * @tags Bookmarks
 * @return {array<Animal>} 200 - Success
 * @return {string} 401 - Unauthorized 
 * @security BearerToken
 */
bookmarkController.get("/", forceLoginMiddleware, getAnimalBookmarks);


export default bookmarkController;