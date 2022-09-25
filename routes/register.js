import express from "express";
import { body, validationResult } from "express-validator";
import db from "../database/database.js";
import crypto from "crypto";
import util from "util";

const router = express.Router();

const scrypt = util.promisify(crypto.scrypt);

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
router.post(
  "/",
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

export default router;
