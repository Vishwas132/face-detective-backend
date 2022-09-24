import express from "express";
import { body, validationResult } from "express-validator";
import cors from "cors";
import knex from "knex";
import util from "util";
import crypto from "crypto";
import dotenv from "dotenv";
dotenv.config();

const scrypt = util.promisify(crypto.scrypt);

const db = knex({
  client: "pg",
  connection: {
    host: process.env.POSTGRESQL_HOST,
    user: process.env.POSTGRESQL_USER,
    password: process.env.POSTGRESQL_PASSWORD,
    database: process.env.POSTGRESQL_DATABASE,
  },
});

const app = express();
app.use(cors());
app.use(express.json());

let users = [];

// Homepage
app.get("/", (req, res) => {
  res.status(200).json("success");
});

async function createUser(req, res) {
  const { name, email, password } = req.body;
  const salt = crypto.randomBytes(16).toString("hex");

  try {
    const hashedBuff = await scrypt(password, salt, 64);

    const hashedSaltPassword = hashedBuff.toString("hex") + ":" + salt;

    db.transaction(async (trx) => {
      return await trx
        .insert({
          email: email,
          password_hash: hashedSaltPassword,
        })
        .into("login")
        .returning("email")
        .then(async (loginEmail) => {
          try {
            const user = await trx("users").returning("*").insert({
              name: name,
              email: loginEmail[0].email,
              joined: new Date(),
            });
            return res.status(200).json(user[0]);
          } catch (err) {
            return res.status(400).json("Unable to register");
          }
        })
        .then(trx.commit)
        .catch(trx.rollback);
    });
  } catch (err) {
    return res.status(400).json("Unable to register");
  }
}

// Register a user
app.post(
  "/register",
  body("email").isEmail(),
  body("password").isLength({ min: 5 }),
  (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    return createUser(req, res);
  }
);

async function verifyPassword(password, hash) {
  const [key, salt] = hash.split(":");
  const keyBuffer = Buffer.from(key, "hex");
  const derivedKey = await scrypt(password, salt, 64);
  return crypto.timingSafeEqual(keyBuffer, derivedKey);
}

// Sign-in a user
app.post(
  "/signin",
  body("email").isEmail(),
  body("password").isLength({ min: 5 }),
  (req, res) => {
    const { email, password } = req.body;
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    db.select("email", "password_hash")
      .from("login")
      .where("email", "=", email)
      .then(async (data) => {
        const isUser = await verifyPassword(password, data[0].password_hash);
        if (!isUser) {
          return res.status(400).json("Wrong email or password");
        } else {
          db.select("*")
            .from("users")
            .where("email", "=", email)
            .then((data) => {
              return res.status(200).json(data[0]);
            })
            .catch((err) => res.status(400).json("User not found"));
        }
      })
      .catch((err) => res.status(400).json("Wrong email or password"));
  }
);

//Update the usage count of a user
app.put("/detect", (req, res) => {
  const { email } = req.body;
  db("users")
    .where("email", "=", email)
    .increment("usage_count", 1)
    .returning("usage_count")
    .then((count) => res.status(200).json(count[0].usage_count))
    .catch((err) => res.status(400).json("Unable to increment counter"));
});

// Delete a user profile
app.delete("/delete", (req, res) => {
  const { id } = req.body;

  for (let index = 0; index < users.length; index++) {
    if (users[index].id === id) {
      users.splice(index, 1);
      return res.status(200).json("success");
    }
  }
  res.status(400).json("User id not forund");
});

app.listen(process.env.PROCESS_PORT, () => {
  console.log(
    `Server listenig on http://localhost:${process.env.PROCESS_PORT}`
  );
});
