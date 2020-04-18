import { AnimalInput, Animal } from "../Entities/animal";
import { runQuery } from "../db/database";
import { User } from "../Entities/user";
import fs from "fs";

const insertAnimalQuery = fs.readFileSync("../db/queries/animals/insert_animal", "utf8");
class AnimalModel {

    public async CreateAnimal(user: User, animal: AnimalInput): Promise<void> {
        try {
            const queryResult = await runQuery<Animal>(
                insertAnimalQuery,
                [
                    user.id,
                    animal.state,
                    animal.species,
                    animal.breeds,
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