const express = require("express");
const router = express.Router();

const fs = require("fs");
const path = require("path");
const { v4: uuidv4 } = require("uuid");

const DATA_FILE = path.join(__dirname, "..", "data.json");

const loadData = () => {
  try {
    return JSON.parse(fs.readFileSync(DATA_FILE));
  } catch {
    return { users: [] };
  }
};

const saveData = (data) => {
  fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2));
};

router.post("/users", (req, res) => {
  const username = req.body.username && req.body.username.trim();
  if (!username) return res.status(400).send("Username is required");

  const data = loadData();
  const userExists = data.users.find((u) => u.username === username);
  if (userExists) {
    return res.json({ username: userExists.username, _id: userExists._id });
  }

  const newUser = { _id: uuidv4(), username, log: [] };
  data.users.push(newUser);
  saveData(data);
  res.json({ username: newUser.username, _id: newUser._id });
});

router.get("/users", (req, res) => {
  const data = loadData();
  const users = data.users.map((u) => ({ username: u.username, _id: u._id }));
  res.json(users);
});

router.post("/users/:_id/exercises", (req, res) => {
  const { _id } = req.params;
  const { description, duration, date } = req.body;

  if (!description || !duration) {
    return res.status(400).send("Description and duration are required");
  }

  const data = loadData();
  const user = data.users.find((u) => u._id === _id);
  if (!user) return res.status(404).send("User not found");

  const exerciseDate = date ? new Date(date) : new Date();
  if (exerciseDate.toString() === "Invalid Date") {
    return res.status(400).send("Invalid date");
  }

  const newExercise = {
    description,
    duration: parseInt(duration),
    date: exerciseDate.toDateString(),
  };

  user.log.push(newExercise);
  saveData(data);

  res.json({
    username: user.username,
    description: newExercise.description,
    duration: newExercise.duration,
    date: newExercise.date,
    _id: user._id,
  });
});

router.get("/users/:_id/logs", (req, res) => {
  const { _id } = req.params;
  const { from, to, limit } = req.query;

  const data = loadData();
  const user = data.users.find((u) => u._id === _id);
  if (!user) return res.status(404).send("User not found");

  let log = [...user.log];

  if (from) {
    const fromDate = new Date(from);
    if (fromDate.toString() === "Invalid Date")
      return res.status(400).send("Invalid from date");
    log = log.filter((e) => new Date(e.date) >= fromDate);
  }

  if (to) {
    const toDate = new Date(to);
    if (toDate.toString() === "Invalid Date")
      return res.status(400).send("Invalid to date");
    log = log.filter((e) => new Date(e.date) <= toDate);
  }

  if (limit) {
    const limitNum = parseInt(limit);
    if (!isNaN(limitNum)) log = log.slice(0, limitNum);
  }

  const formattedLog = log.map(({ description, duration, date }) => ({
    description,
    duration,
    date,
  }));

  res.json({
    username: user.username,
    count: formattedLog.length,
    _id: user._id,
    log: formattedLog,
  });
});

module.exports = router;
