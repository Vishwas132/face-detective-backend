import knex from "knex";
import dotenv from "dotenv";
dotenv.config();

const db = knex({
  client: "pg",
  connection: {
    connectionString: process.env.DATABASE_URL,
    ssl: process.env.DATABASE_URL
      ? {
          rejectUnauthorized: false,
        }
      : false,
  },
});

export default db;
