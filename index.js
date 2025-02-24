const express = require('express')
const app = express()
const cors = require('cors')
const bodyParser = require("body-parser")
const { v4: uuidv4 } = require('uuid');
const userList = []
const usersExercise = [];
require('dotenv').config()

app.use(cors())
app.use(bodyParser.urlencoded({ extended: false }))
app.use(express.static('public'))
app.get('/', (req, res) => {
  res.sendFile(__dirname + '/views/index.html')
});

app.post("/api/users", function(req, res) {
  const usersData = {};
  const users = req.body.username;
  const id = uuidv4();
  console.log(users);

  usersData.username = users;
  usersData._id = id;

  userList.push(usersData);
  
  res.json({
    username: users,
    _id: id
  })
})

app.get("/api/users", function(req, res) {
  res.json(userList);
})

app.post("/api/users/:_id/exercises", function(req, res) {
  const id = req.params._id;
  const description = req.body.description;
  const duration = parseInt(req.body.duration);
  const date = req.body.date || new Date().toDateString();

  const user = userList.find(user => user._id === id);

  const exercise = {
    _id: id,
    username: user.username,
    description: description,
    duration: duration,
    date: date,
  };

  if (!user.exercises) {
   user.exercises = []; 
  }

  usersExercise.push(exercise);

  res.json({
    _id: id,
    username:  user.username,
    date: date,
    duration: duration,
    description: description
  })
})

app.get("/api/users/:_id/logs", function(req, res) {
  const id = req.params._id;
  const {from, to, limit} = req.query
  const user = userList.find(user => user._id === id);
  let usersExercises = usersExercise.filter(exercise => exercise._id === id);

  if(from) {
    const fromDate = new Date(from);
    if(fromDate.toString() !== "Invalid Date") {
      usersExercises = usersExercises.filter(exer => new Date(exer.date) >= fromDate)
    }
  }

  if(to) {
    const toDate = new Date(to);
    if(toDate.toString() !== "Invalid Date") {
      usersExercises = usersExercises.filter(exer => new Date(exer.date) <= toDate);
    }
  }

  if(limit) {
    usersExercises = usersExercises.slice(0, parseInt(limit));
  }

  const log = usersExercises.map(exer => ({
    description: exer.description,
    duration: parseInt(exer.duration),
    date: exer.date
  }))

  res.json({
    "_id": id,
    "username": user.username,
    "count": log.length,
    "log": log
  })
})





const listener = app.listen(process.env.PORT || 3000, () => {
  console.log('Your app is listening on port ' + listener.address().port)
})
