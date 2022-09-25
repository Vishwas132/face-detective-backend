import express from "express";
import { body, validationResult } from "express-validator";
import db from "../database/database.js";
import crypto from "crypto";
import util from "util";

const router = express.Router();
const scrypt = util.promisify(crypto.scrypt);

async function verifyPassword(password, hash) {
  const [key, salt] = hash.split(":");
  const keyBuffer = Buffer.from(key, "hex");
  const derivedKey = await scrypt(password, salt, 64);
  return crypto.timingSafeEqual(keyBuffer, derivedKey);
}

// Sign-in a user
router.post(
  "/",
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

export default router;
