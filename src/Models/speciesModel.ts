import { runQuery } from "../db/database";
import fs from "fs";
import path from "path";


const getAllSpeciesQuery = fs.readFileSync(path.resolve(__dirname, "../db/queries/species/get_all_species.sql"), "utf8");
class SpeciesModel {
    public async GetAllSpecies() {
        const {rows} = await runQuery<{value: string}>(getAllSpeciesQuery);
        return rows.map(r => r.value);
    }
}

export default new SpeciesModel();