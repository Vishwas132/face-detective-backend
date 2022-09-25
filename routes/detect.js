import express from "express";
import fetch from "node-fetch";
import db from "../database/database.js";
import dotenv from "dotenv";
dotenv.config();
const router = express.Router();

// Increment usage count
const incrementCount = async (email) => {
  try {
    const count = await db("users")
      .where("email", "=", email)
      .increment("usage_count", 1)
      .returning("usage_count");
    return count[0].usage_count;
  } catch (err) {
    console.log("Unable to increment counter");
  }
};

//Call API to detect face
router.put("/", (req, res) => {
  const { email, imageUrl } = req.body;
  const { USER_ID, PAT, APP_ID, MODEL_ID, MODEL_VERSION_ID } = process.env;

  console.log("process.env", process.env);

  const raw = JSON.stringify({
    user_app_id: {
      user_id: USER_ID,
      app_id: APP_ID,
    },
    inputs: [
      {
        data: {
          image: {
            url: imageUrl,
          },
        },
      },
    ],
  });

  const requestOptions = {
    method: "POST",
    headers: {
      Accept: "application/json",
      Authorization: "Key " + PAT,
    },
    body: raw,
  };
  fetch(
    "https://api.clarifai.com/v2/models/" +
      MODEL_ID +
      "/versions/" +
      MODEL_VERSION_ID +
      "/outputs",
    requestOptions
  )
    .then((response) => response.json())
    .then(async (result) => {
      console.log("result", result.outputs[0].data.regions);
      if (result.outputs[0].data.regions) {
        const usageCount = await incrementCount(email);
        return res.status(200).json({
          usage_count: usageCount,
          apiResult: result.outputs[0].data.regions,
        });
      } else {
        return res.status(400).json(Error("API sent undefined"));
      }
    })
    .catch((error) => res.status(400).json(error));
});

export default router;
