import express from "express";
import { randomUUID } from "crypto";
import { body, validationResult } from "express-validator";
import cors from "cors";

const app = express();
app.use(cors());
app.use(express.json());

const PORT = 3001;

let users = [];

// Homepage
app.get("/", (req, res) => {
  res.status(200).json("success");
});

// Register a user
app.post(
  "/register",
  body("email").isEmail(),
  body("password").isLength({ min: 5 }),
  (req, res) => {
    const newUser = req.body;
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    users.push({
      id: randomUUID(),
      name: newUser.name,
      email: newUser.email,
      password: newUser.password,
      usageCounter: 0,
      joined: new Date(),
    });
    res.status(200).json(users[users.length - 1]);
  }
);

app.listen(PORT, () => {
  console.log(`Server listenig on http://localhost:${PORT}`);
});
