const express = require("express");
const app = express();
const cors = require("cors");
const mongoose = require("mongoose");
const bodyParser = require("body-parser");
require("dotenv").config();

app.use(cors());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(express.static("public"));

const uri = process.env.MONGO_URI || 'mongodb+srv://se:jinuka123@cluster2.1lbi0.mongodb.net/?retryWrites=true&w=majority&appName=Cluster2';

mongoose.connect(uri, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log("✅ Connected to DB"))
  .catch(err => console.error("❌ DB Connection Error:", err));

// Define Schemas & Models
const userSchema = new mongoose.Schema({
  username: { type: String, required: true },
});

const exerciseSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, required: true },
  description: { type: String, required: true },
  duration: { type: Number, required: true },
  date: { type: Date, required: true },
});

const User = mongoose.model("User", userSchema);
const Exercise = mongoose.model("Exercise", exerciseSchema);

// Create a new user ✅
app.post("/api/users", async (req, res) => {
  try {
    const newUser = new User({ username: req.body.username });
    const savedUser = await newUser.save();
    res.json(savedUser);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get all users ✅
app.get("/api/users", async (req, res) => {
  try {
    const users = await User.find({}, "username _id").exec();
    res.json(users);
  } catch (err) {
    res.status(500).json({ error: "Error fetching users" });
  }
});

// Add an exercise ✅ FIXED: Proper date handling & response format
app.post("/api/users/:_id/exercises", async (req, res) => {
  try {
    const { _id } = req.params;
    const { description, duration, date } = req.body;

    if (!description || !duration) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    const user = await User.findById(_id);
    if (!user) return res.status(404).json({ error: "User not found" });

    const exerciseDate = date ? new Date(date) : new Date();
    if (isNaN(exerciseDate.getTime())) {
      return res.status(400).json({ error: "Invalid date format" });
    }

    const newExercise = new Exercise({
      userId: _id,
      description,
      duration: parseInt(duration),
      date: exerciseDate,
    });

    const savedExercise = await newExercise.save();

    res.json({
      _id: user._id,
      username: user.username,
      description: savedExercise.description,
      duration: savedExercise.duration,
      date: savedExercise.date.toDateString(),
    });

  } catch (err) {
    console.error("❌ Error in POST /api/users/:_id/exercises:", err);
    res.status(500).json({ error: err.message });
  }
});

// Get user logs ✅ FIXED: count, log format, query parameters
app.get("/api/users/:_id/logs", async (req, res) => {
  try {
    const { from, to, limit } = req.query;
    const { _id } = req.params;

    const user = await User.findById(_id);
    if (!user) return res.status(404).json({ error: "User not found" });

    let filter = { userId: _id };
    let dateFilter = {};

    if (from) dateFilter["$gte"] = new Date(from);
    if (to) dateFilter["$lte"] = new Date(to);
    if (from || to) filter.date = dateFilter;

    const exercises = await Exercise.find(filter)
      .sort({ date: 1 })
      .limit(parseInt(limit) || 0)
      .exec();

    const log = exercises.map(ex => ({
      description: ex.description.toString(),
      duration: Number(ex.duration),
      date: ex.date.toDateString(),
    }));

    res.json({
      _id: user._id,
      username: user.username,
      count: log.length,
      log,
    });

  } catch (err) {
    console.error("❌ Error in GET /api/users/:_id/logs:", err);
    res.status(500).json({ error: err.message });
  }
});

const listener = app.listen(process.env.PORT || 3000, () => {
  console.log("Your app is listening on port " + listener.address().port);
});
