const express = require('express')
const app = express()
const cors = require('cors')
require('dotenv').config()
const mongoose = require('mongoose');
mongoose.connect(process.env.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true });

app.use(cors());
app.use(express.static('public'));
app.use(express.urlencoded({ extended: true }));

const Schema = mongoose.Schema;

// get username
const userSchema = new Schema({
    username: { type: String, required: true }
});

const User = mongoose.model('User', userSchema);

app.get('/', (req, res) => {
  res.sendFile(__dirname + '/views/index.html')
});

// POST to /api/users with form data "username" to create a new user
app.post('/api/users', async (req, res) => {
  try {
    const { username } = req.body;

    if (!username) {
      return res.status(400).json({ error: 'Username is required' });
    }

    const newUser = new User({ username });
    const savedUser = await newUser.save();

    res.json({ username: savedUser.username, _id: savedUser._id });
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

function formatDate(date) {
  return new Date(date).toDateString(); // Example: "Mon Aug 04 2025"
};

const exerciseSchema = new Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  description: { type: String, required: true },
  duration: { type: Number, required: true },
  date: { type: Date, required: true }
});

const Exercise = mongoose.model('Exercise', exerciseSchema);

app.post('/api/users', express.urlencoded({ extended: false }), (req, res) => {
  const newUser = new User({ username: req.body.username });
  newUser.save((err, savedUser) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ username: savedUser.username, _id: savedUser._id });
  });
});

//POST /api/isers/:_id/exercises
app.post('/api/users/:_id/exercises', express.urlencoded({ extended: false }), async (req, res) => {
  const { description, duration, date } = req.body;
  const userId = req.params._id;

  if (!description || !duration) {
    return res.status(400).json({ error: 'Description and duration are required.' });
  }
  
  try {
    const user = await User.findById(userId);
    if (!user) return res.status(400).json({ error: 'User not found' });

    const exercise = new Exercise({
      userId,
      description,
      duration: parseInt(duration),
      date: date ? new Date(date) : new Date()
    });

    const savedExercise = await exercise.save();

    res.json({
      _id: user._id,
      username: user.username,
      date: formatDate(savedExercise.date), //apply Date formatting here
      duration: savedExercise.duration,
      description: savedExercise.description
    });
    
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get('/api/users', async (req, res) => {
  const users = await User.find({}, '_id username');
  res.json(users);
});

// GET /api/users/:_id/logs with query parameters
app.get('/api/users/:_id/logs', async (req, res) => {
  const { from, to, limit } = req.query;
  const userId = req.params._id;

  try {
    const user = await User.findById(userId);
    if (!user) return res.status(400).json({ error: 'User not found' });

    let filter = { userId };
    if (from || to) {
      filter.date = {};
      if (from) filter.date.$gte = new Date(from);
      if (to) filter.date.$lte = new Date(to);
    }

    let query = Exercise.find(filter).select('description duration date');
    if (limit) query = query.limit(parseInt(limit));

    const exercises = await query.exec();

    res.json({
      username: user.username,
      count: exercises.length,
      _id: user._id,
      log: exercises.map(e => ({
        description: e.description,
        duration: e.duration,
        date: formatDate(e.date)  // Apply date formatting here
      }))
    });
    } catch (err) {
    res.status(500).json({ error: err.message });
    }
  });

process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection:', reason);
});

process.on('uncaughtException', (err) => {
  console.error('Uncaught Exception:', err);
});

const listener = app.listen(process.env.PORT || 3000, () => {
  console.log('Your app is listening on port ' + listener.address().port)
})
