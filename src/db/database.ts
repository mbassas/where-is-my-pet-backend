import sqlite from "sqlite3";
import path from "path"

const driver = new sqlite.Database(path.resolve(__dirname, "../../database.db"));

export function runQuery<T = any>(query: string, params: object): Promise<T[]> {
    console.log(query, params);
    return new Promise<T[]>((resolve, reject) => {
        driver.all(query, params, (err: Error, rows: T[]) => {
            if (err) {
                reject(err);
                return;
            }

            resolve(rows);
        })
    })
}