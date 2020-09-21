import { Router, Response } from "express";
import { ApiRequest } from "..";
import CustomError, { ErrorType } from "../Models/customErrors";
import multer from "multer";
import imageRecognitionModel from "../Models/imageRecognitionModel";
import fs from "fs";

const upload = multer({dest: "uploads/"});

const imageRecognitionController = Router();

async function getAnimalInfo (req: ApiRequest, res: Response) {
    try {
        if (!req.file) {
            throw new CustomError(ErrorType.ANIMAL_IMAGES_REQUIRED);
        }
        const animal = await imageRecognitionModel.GetAnimalParams(req.file.path);
        res.status(200).send(animal);
    } catch (e) {
        console.error(e);
        if (e instanceof CustomError) {
            res.status(e.getHttpStatusCode()).send(e.getMessage());
        } else {
            res.sendStatus(500);
        }
    } finally {
        // Remove the image from disk
        fs.unlink(req.file.path, () => {});
    }
};

/**
 * @typedef {object} ImageRecognitionParams
 * @property {string} image.required - The image - binary
 */

/**
 * POST /image-recognition
 * @tags Image Recognition
 * @summary Gets animal info by image recognition
 * @param {ImageRecognitionParams} request.body.required - Body - multipart/form-data
 * @return {Animal} 200 - Success
 * @return {string} 400 - Images is required
 */
imageRecognitionController.post("/", upload.single("image"), getAnimalInfo);

export default imageRecognitionController;
