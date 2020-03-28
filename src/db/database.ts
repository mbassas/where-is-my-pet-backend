import pg from 'pg';
import Config from "../config";

const pool = new pg.Pool({
    connectionString: Config.DATABASE_URL,
});

export async function runQuery<T = any>(query: string, params: any[]) {
    try {
        const result = await pool.query<T>(query, params)
        return result;
    } catch (e) {
        console.error(e);
        throw e;
    }
}
