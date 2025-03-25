import { Pool } from "pg";
import { ExpressUser } from "../types/global";

export class PigeonDbClient {
    private static instance: Pool | null = null;

    private constructor() {}

    public static getInstance(): Pool {
        if (!PigeonDbClient.instance) {
            const databaseUrl = process.env.PIGEON_DATABASE_URL;
            if (!databaseUrl) {
                throw new Error('PIGEON_DATABASE_URL environment variable is not set');
            }
            PigeonDbClient.instance = new Pool({
                connectionString: databaseUrl
            });
        }
        return PigeonDbClient.instance;
    }

    public static async registerUser(username: string, email: string, password: string) {
        const db = PigeonDbClient.getInstance();
        const query = {
            text: 'INSERT INTO "User"(username, email, password) VALUES($1, $2, $3)',
            values: [username, email, password]
        };
        try {
            return (await db.query(query)).rows[0];
        } catch (error) {
            return error;
        }
    }

    public static async checkUserExists(user: ExpressUser) {
        const db = PigeonDbClient.getInstance();
        const query = {
            text: 'SELECT * FROM "User" WHERE id = $1 AND email = $2 AND username = $3',
            values: [user.id, user.email, user.username]
        }
        try {
            return (await db.query(query)).rows[0];
        } catch (error) {
            return error
        }
    }
}