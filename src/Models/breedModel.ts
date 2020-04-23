import { runQuery } from "../db/database";
import fs from "fs";
import path from "path";

const getBreedsBySpeciesQuery = fs.readFileSync(path.resolve(__dirname, "../db/queries/breeds/get_breeds_by_species.sql"), "utf8");
class breedModel {
    public async GetBreedsBySpecies(species: string) {
        const { rows } = await runQuery<{ value: string }>(getBreedsBySpeciesQuery, [
            species
        ]);
        return rows.map(r => r.value);
    }
}

export default new breedModel();