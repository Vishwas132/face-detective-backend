import express from "express";

const app = express();

const PORT = 3001;

// Homepage
app.get("/", (req, res) => {
  res.status(200).json("success");
});

app.listen(PORT, () => {
  console.log(`Server listenig on http://localhost:${PORT}`);
});
