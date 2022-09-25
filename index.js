import express from "express";
import cors from "cors";
import registerRouter from "./routes/register.js";
import signinRouter from "./routes/signin.js";
import detectRouter from "./routes/detect.js";
import deleteRouter from "./routes/delete.js";

const app = express();
app.use(cors());
app.use(express.json());
app.use("/register", registerRouter);
app.use("/signin", signinRouter);
app.use("/detect", detectRouter);
app.use("/delete", deleteRouter);

// Homepage
app.get("/", (req, res) => {
  res.status(200).json("success");
});

app.listen(process.env.PORT, () => {
  console.log(`Server listenig on http://localhost:${process.env.PORT}`);
});
