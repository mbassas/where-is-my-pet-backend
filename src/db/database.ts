import pg from 'pg';
import Config from "../config";
import { LargeObjectManager } from 'pg-large-object';
import fs from "fs";
import e from 'express';

const pool = new pg.Pool({
    connectionString: Config.DATABASE_URL,
});

export async function runQuery<T = any>(query: string, params: any[] = []) {
    try {
        const result = await pool.query<T>(query, params)
        return result;
    } catch (e) {
        console.error(e);
        throw e;
    }
}

export async function insertLargeObject(file: string):Promise<number> {
    try{
        const client = await pool.connect();

        const largeObjectManager = new LargeObjectManager({pg: client});

        // When working with Large Objects, always use a transaction
        await client.query("BEGIN");
        const oid = await new Promise<number>((resolve, reject) => {
            largeObjectManager.createAndWritableStream(16384, (err, oid, stream) => {
                if (err) {
                    reject(err);
                    return;
                }

                stream.on("finish", async () => {
                    // Close the transaction
                    await client.query("COMMIT");

                    resolve(oid);
                });

                fs.createReadStream(file).pipe(stream);
            });
        });

        return oid;
    } catch(e) {
        console.error(e);
        throw e;
    }
}

export async function readLargeObject(oid: number): Promise<Buffer> {
    try {
        const client = await pool.connect();
        
        const largeObjectManager = new LargeObjectManager({ pg: client });

        // When working with Large Objects, always use a transaction
        await client.query("BEGIN");
        
        const image = await largeObjectManager.openAsync(oid, LargeObjectManager.READ);
        const size = await image.sizeAsync();
        
        const buffer = image.readAsync(size);

        // Close the transaction
        await client.query("COMMIT");

        return buffer;
    } catch (e) {
        console.error(e);
        throw e;
    }
}
