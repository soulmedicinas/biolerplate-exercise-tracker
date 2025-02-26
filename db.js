

// trying to combine db collections
const express = require("express");
const app = express();
const cors = require("cors");
const mongoose = require("mongoose");
const { User, Exercise } = require("./db.js"); // Correct import
const bodyParser = require("body-parser");
require("dotenv").config();

app.use(cors());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

app.get("/api/users/:_id/v2", async (req, res) => {
  try {
    const { _id } = req.params;
    console.log(`Getting User by _id... ${_id}`);

    const targetUser = await User.findById(_id);
    if (!targetUser) return res.status(404).json({ error: "User not found" });

    const userExercise = await Exercise.find({ userId: _id });

    res.json({
      _id: targetUser._id,
      username: targetUser.username,
      count: userExercise.length,
      log: userExercise.map(({ description, duration, date }) => ({
        description,
        duration,
        date: date.toDateString(),
      })),
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Server Error" });
  }
});
