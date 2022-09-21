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

    for (let user of users) {
      if (user.email === email && user.password === password) {
        return res.status(200).json(user);
      }
    }
    res.status(400).json("Wrong email or password");
  }
);

//Update a user counter
app.put("/detect", (req, res) => {
  const { id } = req.body;
  for (const user of users) {
    if (user.id === id) {
      user.usageCounter++;
      return res.status(200).json("success");
    }
  }
});

app.listen(PORT, () => {
  console.log(`Server listenig on http://localhost:${PORT}`);
});
