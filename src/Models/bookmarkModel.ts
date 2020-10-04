import { runQuery } from "../db/database";
import insertBookmarkQuery from "../db/queries/bookmarks/insert_bookmark";
import fs from "fs";
import path from "path";
import CustomError, { ErrorType } from "./customErrors";
import { Animal } from "../Entities/animal";
import animalModel from "./animalModel";

const deleteBookmarkQuery = fs.readFileSync(path.resolve(__dirname, "../db/queries/bookmarks/delete_bookmark.sql"), "utf8");

class BookmarkModel {
    public async GetAnimalIdsByUserId(userId: number) {
        const bookmarks = await runQuery<{animal_id: number}>("SELECT animal_id from bookmarks WHERE user_id = $1", [userId]);
        
        // [{animal_id: 1}] => [1]
        return bookmarks.rows.map(({animal_id}) => animal_id);
    }
    
    public async GetAnimalsByUserId(userId: number): Promise<Animal[]> {
        const animalIds = await this.GetAnimalIdsByUserId(userId);

        let animals = [];
        for (const animalId of animalIds) {
            animals.push(animalModel.GetAnimalById(animalId))
        }

        // Execute all queries in parallel
        animals = await Promise.all(animals);

        for (const animal of animals) {
            animal.bookmark = true;
        }

        return animals;
    }

    public async CreateBookmark(userId: number, animalId: number): Promise<void> {
        try {
            await runQuery<void>(insertBookmarkQuery, [
                userId,
                animalId
            ]);
        }catch (e) {
            if (e.constraint === "bookmarks_animal_id_fkey") {
                throw new CustomError(ErrorType.NOT_FOUND);
            }
            if (e.constraint === "bookmarks_animal_and_user_unique") {
                return;
            }
            throw e;
        }
    }

    public async DeleteBookmark(userId: number, animalId: number): Promise<void> {
        await runQuery<void>(deleteBookmarkQuery, [
            userId,
            animalId
        ]);
    }
};

export default new BookmarkModel();