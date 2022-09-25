import knex from "knex";
import dotenv from "dotenv";
dotenv.config();

const db = knex({
  client: "pg",
  connection:
    process.env.DATABASE_URL === "smart-brain"
      ? {
          host: process.env.HOST,
          user: process.env.USER,
          password: process.env.PASSWORD,
          database: process.env.DATABASE_URL,
        }
      : {
          connectionString: process.env.DATABASE_URL,
          password: process.env.PASSWORD,
          ssl: {
            rejectUnauthorized: false,
          },
        },
});

export default db;
