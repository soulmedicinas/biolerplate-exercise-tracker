const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const { Schema } = mongoose;
require('dotenv').config();

const app = express();

// connect to db
mongoose.connect(process.env.DB_URL, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log('MongoDB connected'))
  .catch(err => console.error('MongoDB connection error:', err));

// schemas and models
const UserSchema = new Schema({
  username: { type: String, required: true }
});
const User = mongoose.model('User', UserSchema);

const ExerciseSchema = new Schema({
  user_id: { type: Schema.Types.ObjectId, required: true, ref: 'User' },
  description: String,
  duration: Number,
  date: { type: Date, default: Date.now }
});
const Exercise = mongoose.model('Exercise', ExerciseSchema);

// middleware
app.use(cors());
app.use(express.static('public'));
app.use(express.urlencoded({ extended: true }));

app.get('/', (req, res) => {
  res.sendFile(__dirname + '/views/index.html');
});

app.get('/api/users', async (req, res) => {
  try {
    const users = await User.find().select('_id username');
    res.json(users);
  } catch (err) {
    res.status(500).send('Error fetching users');
  }
});

app.post('/api/users', async (req, res) => {
  try {
    const user = new User({ username: req.body.username });
    const savedUser = await user.save();
    res.status(201).json(savedUser);
  } catch (err) {
    res.status(500).send('Error creating user');
  }
});

app.post('/api/users/:_id/exercises', async (req, res) => {
  try {
    const user = await User.findById(req.params._id);
    if (!user) {
      return res.status(404).send('User not found');
    }

    const exercise = new Exercise({
      user_id: user._id,
      description: req.body.description,
      duration: req.body.duration,
      date: req.body.date ? new Date(req.body.date) : new Date()
    });
    
    const savedExercise = await exercise.save();
    res.json({
      _id: user._id,
      username: user.username,
      description: savedExercise.description,
      duration: savedExercise.duration,
      date: savedExercise.date.toDateString()
    });
  } catch (err) {
    res.status(500).send('Error saving exercise');
  }
});

app.get('/api/users/:_id/logs', async (req, res) => {
  const { from, to, limit = 500 } = req.query;
  try {
    const user = await User.findById(req.params._id);
    if (!user) {
      return res.status(404).send('User not found');
    }

    const filter = { user_id: user._id };
    if (from || to) {
      filter.date = {};
      if (from) filter.date.$gte = new Date(from);
      if (to) filter.date.$lte = new Date(to);
    }

    const exercises = await Exercise.find(filter).limit(Number(limit));
    const log = exercises.map(e => ({
      description: e.description,
      duration: e.duration,
      date: e.date.toDateString()
    }));

    res.json({
      username: user.username,
      count: exercises.length,
      _id: user._id,
      log
    });
  } catch (err) {
    res.status(500).send('Error fetching logs');
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
