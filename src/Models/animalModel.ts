import { AnimalInput, Animal } from "../Entities/animal";
import { runQuery, insertLargeObject, readLargeObject } from "../db/database";
import { User } from "../Entities/user";
import fs from "fs";
import path from "path";
import sharp from "sharp";
import {v4 as uuid} from "uuid";
import getAnimalsQuery, { IGetAnimalQueryParams } from "../db/queries/animals/get_animals";
import updateAnimalQuery from "../db/queries/animals/update_animal";
import imageRecognitionModel from "./imageRecognitionModel";
import sendEmail from "./emailModel";
import CustomError, { ErrorType } from "./customErrors";
import userModel from "./userModel";
import notificationModel from "./notificationModel";

const insertAnimalQuery = fs.readFileSync(path.resolve(__dirname, "../db/queries/animals/insert_animal.sql"), "utf8");
const insertAnimalImageQuery = fs.readFileSync(path.resolve(__dirname, "../db/queries/animals/insert_animal_image.sql"), "utf8");
const getAnimalByIdQuery = fs.readFileSync(path.resolve(__dirname, "../db/queries/animals/get_animal_by_id.sql"), "utf8");
const getAnimalImageQuery = fs.readFileSync(path.resolve(__dirname, "../db/queries/animals/get_animal_image.sql"), "utf8");
const deleteAnimalQuery = fs.readFileSync(path.resolve(__dirname, "../db/queries/animals/delete_animal_by_id.sql"), "utf8");

class AnimalModel {

    public async GetAnimalById(id: number): Promise<Animal> {
    
        const queryResult = await runQuery<Animal>(getAnimalByIdQuery, [
            id
        ]);
        if (queryResult.rowCount !== 1 || !queryResult.rows[0].published) {
            throw new CustomError(ErrorType.NOT_FOUND);
        }
        return queryResult.rows[0];
    };

    public async GetAnimals(params: IGetAnimalQueryParams): Promise<Animal[]> {
        const queryResult = await runQuery<Animal>(getAnimalsQuery(params));

        return queryResult.rows;
    }

    public async CreateAnimal(user: User, animal: AnimalInput, animalImages: Express.Multer.File[], imagePath: string ): Promise<number> {
        
        const unsafeContent = await imageRecognitionModel.hasInappropriateContent(imagePath);

        animal.published = true;
        if (unsafeContent) {
            animal.published = false;
            await sendEmail({
                destinationEmail: user.email,
                subject: "Suspicious content",
                body: `<p>Hi ${user.name} ${user.surname},<p>Your content will be published once it has been evaluated by our team. Thanks for understanding.</p> <p>Best wishes, <br/>Where is my Pet team</p>`
            });

            const notification =
            {   user_id: user.id,
                message: "Your animal has been flagged as suspicious content. Please check your email for more details.",
                link: "",
                read: false
            };
    
            notificationModel.InsertNotification(notification);

            user.status = "Suspicious";
            await userModel.UpdateUser(user.id, user);
        }

        try {
            const queryResult = await runQuery<Animal>(
                insertAnimalQuery,
                [
                    user.id,
                    animal.status,
                    animal.species,
                    animal.breed,
                    animal.size,
                    animal.color,
                    animal.name,
                    animal.gender,
                    animal.age,
                    animal.lat,
                    animal.lng,
                    animal.location,
                    animal.published
                ]
            );
            const animalId = queryResult.rows[0].id;
            
            try {
                // Insert animal photos
                for (let i = 0; i < animalImages.length; i++) {
                    const image = animalImages[i];
                    const {path, mimetype} = await this.resizeImage(image);
                    const oid = await insertLargeObject(path);

                    await runQuery(insertAnimalImageQuery, [
                        animalId,
                        oid,
                        mimetype,
                        uuid().split("-").join("")
                    ]);
                }
            } catch(e) {
                // If image insert fails, rollback all data previously inserted
                await runQuery(deleteAnimalQuery, [animalId]);
                throw e;
            }

            if (!unsafeContent) {
                const notification =
                {   user_id: user.id,
                    message: "Your animal has been registered.",
                    link: `/view-animal/${animalId}`,
                    read: false
                };
                notificationModel.InsertNotification(notification);
            }
    

            return animalId;
        } catch(e) {
            console.error(e);
            throw e;
        } finally {

            // Cleanup uploads directory
            for (let i = 0; i < animalImages.length; i++) {
                // delete the file from disk
                fs.unlinkSync(animalImages[i].path);
                fs.unlinkSync(`${animalImages[i].path}-resized`);
            }
        }
    }   

    public async GetImage(animalId: number, imageName: string): Promise<Buffer> {
        try {
            const queryResult = await runQuery<{id: number, image: number, animalId: number}>(
                getAnimalImageQuery,
                [animalId, imageName]
            );

            return readLargeObject(queryResult.rows[0].image);
        } catch (e) {
            throw new CustomError(ErrorType.NOT_FOUND);
        }
    }

    private async resizeImage(image: Express.Multer.File): Promise<{path: string, mimetype: string}> {
        const destinationPath = `${image.path}-resized`;
        await sharp(image.path).resize(1000).png().toFile(destinationPath);

        return {
            path: destinationPath,
            mimetype: "image/png"
        }
    }

    public async UpdateAnimal (animalId: number, params: Partial<Animal>) {

        try {
            const animal = await this.GetAnimalById(animalId);
            const updatedAnimal = {
                ...animal,
                ...params,
            };

            await runQuery<Animal>(
            updateAnimalQuery,
            [
                updatedAnimal.id,
                updatedAnimal.recovered
            ]
        ); 

        const notification =
        {   user_id: updatedAnimal.user_id,
            message: "Your animal has been marked as recovered.",
            link: `/view-animal/${updatedAnimal.id}`,
            read: false
        };

        notificationModel.InsertNotification(notification);

        } catch (e) {
            console.error(e);
            throw e;
        }
       
    };
}

export default new AnimalModel();