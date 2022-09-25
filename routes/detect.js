import express from "express";
import db from "../database/database.js";
const router = express.Router();

//Update the usage count of a user
router.put("/", (req, res) => {
  const { email } = req.body;
  db("users")
    .where("email", "=", email)
    .increment("usage_count", 1)
    .returning("usage_count")
    .then((count) => res.status(200).json(count[0].usage_count))
    .catch((err) => res.status(400).json("Unable to increment counter"));
});

export default router;
