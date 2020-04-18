import { AnimalInput, Animal } from "../Entities/animal";
import { runQuery } from "../db/database";
import { User } from "../Entities/user";
import fs from "fs";
import path from "path";

const insertAnimalQuery = fs.readFileSync(path.resolve(__dirname, "../db/queries/animals/insert_animal.sql"), "utf8");
const getAnimalByIdQuery = fs.readFileSync(path.resolve(__dirname, "../db/queries/animals/get_animal_by_id.sql"), "utf8");
class AnimalModel {

    public async GetAnimalById(id: number): Promise<Object> {
        const queryResult = await runQuery<Animal>(getAnimalByIdQuery, [
            id
        ]);
        if (queryResult.rowCount !== 1) {
            return null;
        }
        return queryResult.rows[0];
    };

    public async CreateAnimal(user: User, animal: AnimalInput): Promise<number> {
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
                    animal.images,
                ]
            );
            return queryResult.rows[0].id;
        }catch(e) {
            console.error(e);
            throw e;
        }
    }   

}

export default new AnimalModel();