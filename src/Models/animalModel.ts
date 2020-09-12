import { AnimalInput, Animal } from "../Entities/animal";
import { runQuery, insertLargeObject, readLargeObject } from "../db/database";
import { User } from "../Entities/user";
import fs from "fs";
import path from "path";
import sharp from "sharp";
import {v4 as uuid} from "uuid";
const osm = require("osm-static-maps");
import CustomError, { ErrorType } from "./customErrors";
import getAnimalsQuery, { IGetAnimalQueryParams } from "../db/queries/animals/get_animals";

const insertAnimalQuery = fs.readFileSync(path.resolve(__dirname, "../db/queries/animals/insert_animal.sql"), "utf8");
const insertAnimalImageQuery = fs.readFileSync(path.resolve(__dirname, "../db/queries/animals/insert_animal_image.sql"), "utf8");
const getAnimalByIdQuery = fs.readFileSync(path.resolve(__dirname, "../db/queries/animals/get_animal_by_id.sql"), "utf8");
const getAnimalImageQuery = fs.readFileSync(path.resolve(__dirname, "../db/queries/animals/get_animal_image.sql"), "utf8");
const deleteAnimalQuery = fs.readFileSync(path.resolve(__dirname, "../db/queries/animals/delete_animal_by_id.sql"), "utf8");
const getAnimalLocationQuery = fs.readFileSync(path.resolve(__dirname, "../db/queries/animals/get_animal_location.sql"), "utf8");
class AnimalModel {

    public async GetAnimalById(id: number): Promise<Animal> {
        const queryResult = await runQuery<Animal>(getAnimalByIdQuery, [
            id
        ]);
        if (queryResult.rowCount !== 1) {
            return null;
        }
        return queryResult.rows[0];
    };

    public async GetAnimals(params: IGetAnimalQueryParams): Promise<Animal[]> {
        const queryResult = await runQuery<Animal>(getAnimalsQuery(params));

        return queryResult.rows;
    }

    public async CreateAnimal(user: User, animal: AnimalInput, animalImages: Express.Multer.File[]): Promise<number> {
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
                    animal.location
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

                // Generate location thumbnail
                // const map = await this.generateMapImage(animal.lat, animal.lng);
                // const mapOid = await insertLargeObject(map);
                // await runQuery<void>("UPDATE animal_location SET map_image = $1 WHERE id = (SELECT location_id FROM animals WHERE id = $2)", [mapOid, animalId]);                
            } catch(e) {
                // If image insert fails, rollback all data previously inserted
                await runQuery(deleteAnimalQuery, [animalId]);
                throw e;
            }

            return animalId;
        } catch(e) {
            console.error(e);
            throw e;
        } finally {
            // Cleanup uploads directory
            for (let i = 0; i < animalImages.length; i++) {
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

        }
    }

    public async GetLocationImage(animalId: number) {
        try {
            const result = await runQuery<any>(getAnimalLocationQuery, [animalId]);
            
            if (result.rowCount === 0) {
                throw new CustomError(ErrorType.NOT_FOUND);
            }

            const oid = result.rows[0].map_image;

            const image = await readLargeObject(oid);
            return image;            
        } catch (e) {
            throw e;
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

    public async generateMapImage (lat: number, lng: number): Promise<Buffer>{
        try {

            const geojson = {
                "type":"Point",
                "coordinates": [lng, lat]
            };

            return await osm({geojson: JSON.stringify(geojson), height: 300, width: 600, zoom: 15});
        } catch (e) {
            console.error(e);
        }
    }
}

export default new AnimalModel();