import { AnimalInput, Animal } from "../Entities/animal";
import { runQuery } from "../db/database";
import { User } from "../Entities/user";
import fs from "fs";
import path from "path";

const insertAnimalQuery = fs.readFileSync(path.resolve(__dirname, "../db/queries/animals/insert_animal.sql"), "utf8");
class AnimalModel {

    public async CreateAnimal(user: User, animal: AnimalInput): Promise<void> {
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
        }catch(e) {
            console.error(e);
            throw e;
        }
    }   

}

export default new AnimalModel();