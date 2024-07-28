const express = require('express');
const app = express();
const cors = require('cors');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
require('dotenv').config();

app.use(cors());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(express.static('public'));
app.get('/', (req, res) => {
  res.sendFile(__dirname + '/index.html');  // Ensure this path is correct
});

// Connect to MongoDB
mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
}).then(() => {
  console.log('Connected to MongoDB');
}).catch(err => {
  console.error('Failed to connect to MongoDB', err);
});

const userSchema = new mongoose.Schema({
  username: { type: String, required: true }
});

const exerciseSchema = new mongoose.Schema({
  userId: { type: String, required: true },
  description: { type: String, required: true },
  duration: { type: Number, required: true },
  date: { type: String, required: true }
});

const User = mongoose.model('User', userSchema);
const Exercise = mongoose.model('Exercise', exerciseSchema);

// Create a new user
app.post('/api/users', (req, res) => {
  const newUser = new User({ username: req.body.username });
  newUser.save((err, savedUser) => {
    if (err) return res.status(400).json('Error: ' + err);
    res.json({ username: savedUser.username, _id: savedUser._id });
  });
});

// Get all users
app.get('/api/users', (req, res) => {
  User.find({}, (err, users) => {
    if (err) return res.status(400).json('Error: ' + err);
    res.json(users);
  });
});

// Add exercises
app.post('/api/users/:_id/exercises', (req, res) => {
  const userId = req.params._id;
  const { description, duration, date } = req.body;
  const exerciseDate = date ? new Date(date).toDateString() : new Date().toDateString();

  User.findById(userId, (err, user) => {
    if (err) return res.status(400).json('Error: ' + err);
    if (!user) return res.status(400).json('User not found');

    const newExercise = new Exercise({
      userId: userId,
      description: description,
      duration: parseInt(duration),
      date: exerciseDate
    });

    newExercise.save((err, savedExercise) => {
      if (err) return res.status(400).json('Error: ' + err);
      res.json({
        username: user.username,
        description: savedExercise.description,
        duration: savedExercise.duration,
        date: savedExercise.date,
        _id: user._id
      });
    });
  });
});

// Get user's exercise log
app.get('/api/users/:_id/logs', (req, res) => {
  const userId = req.params._id;
  const { from, to, limit } = req.query;

  User.findById(userId, (err, user) => {
    if (err) return res.status(400).json('Error: ' + err);
    if (!user) return res.status(400).json('User not found');

    let dateFilter = {};
    if (from) dateFilter.$gte = new Date(from).toDateString();
    if (to) dateFilter.$lte = new Date(to).toDateString();

    let query = { userId: userId };
    if (from || to) query.date = dateFilter;

    Exercise.find(query).limit(parseInt(limit)).exec((err, exercises) => {
      if (err) return res.status(400).json('Error: ' + err);

      res.json({
        username: user.username,
        count: exercises.length,
        _id: user._id,
        log: exercises.map(ex => ({
          description: ex.description,
          duration: ex.duration,
          date: ex.date
        }))
      });
    });
  });
});

const listener = app.listen(process.env.PORT || 3000, () => {
  console.log('Your app is listening on port ' + listener.address().port);
});


