import express from "express";
import db from "../database/database.js";
const router = express.Router();

// Delete a user profile
router.delete("/", (req, res) => {
  const { email } = req.body;

  db("users")
    .where("email", email)
    .del()
    .returning("email")
    .then((data) => {
      db("login")
        .where("email", data[0].email)
        .del()
        .returning("email")
        .then((email) => res.status(200).json(email[0].email))
        .catch((err) => res.status(400).json(err));
    })
    .catch((err) => res.status(400).json(err));
});

export default router;
