import pkg from 'pg';
import { config } from 'dotenv';

config({ path: './config/config.env' });

const { Client } = pkg;
const database = new Client({
    host: process.env.PGHOST,
    database: process.env.PGDATABASE,
    user: process.env.PGUSER,
    password: process.env.PGPASSWORD,
    port: process.env.PGPORT,
    ssl:
        process.env.NODE_ENV === 'production'
            ? { rejectUnauthorized: false, require: true }
            : { require: true }
});

try {
    await database.connect();
    console.log('Database connected successfully');
} catch (error) {
    console.error('Database connection error:', error);
    process.exit(1);
}

export default database;
