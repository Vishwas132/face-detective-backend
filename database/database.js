import knex from "knex";
import dotenv from "dotenv";
dotenv.config();

const db = knex({
  client: "pg",
  connection: {
    connectionString: process.env.DATABASE_URL,
    ssl: true,
  },
});

export default db;
