const express = require("express");
const app = express();
const cors = require("cors");
require("dotenv").config();
require("body-parser");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const { Schema } = require("mongoose");

app.use(cors());
app.use(express.static("public"));
app.use(bodyParser.urlencoded({ extended: false }));

mongoose.connect(process.env.MONGO_URI);

//variables
const userArray = [];

const userSchema = new Schema({
  username: {
    type: String,
    required: true,
  },
});

const exerciseSchema = new Schema({
  username: {
    type: String,
    required: true,
  },
  user_id: {
    type: String,
    required: true,
  },
  description: {
    type: String,
    required: true,
  },
  duration: {
    type: Number,
    required: true,
  },
  date: {
    type: Date,
    required: true,
  },
});

const logSchema = new Schema({
  username: {
    type: String,
    required: true,
  },
  count: {
    type: Number,
    required: true,
  },
  _id: {
    type: String,
    required: true,
  },
  log: {
    type: Array,
    required: true,
  },
});

const User = mongoose.model("User", userSchema);
const Exercise = mongoose.model("Exercise", exerciseSchema);
const Log = mongoose.model("Log", logSchema);

module.exports = User;
module.exports = Exercise;
module.exports = Log;

app.get("/", (req, res) => {
  res.sendFile(__dirname + "/views/index.html");
});

app.get("/api/hello", function (req, res) {
  res.json({ greeting: "hello API" });
});

// POST request to create user
app.post("/api/users", async (req, res) => {
  const user = new User({
    username: req.body.username,
  });
  const log = new Log({
    username: req.body.username,
    count: 0,
    _id: user._id,
    log: [],
  });

  try {
    await user.save();
    await log.save();
    userArray.push(user);
    res.json(user);
  } catch (err) {
    console.log(err);
  }
});

// GET request to get all users
app.get("/api/users", function (req, res) {
  res.json(userArray);
});

// POST request to create exercise
app.post("/api/users/:_id/exercises", async (req, res) => {
  const user = await User.findById({ _id: req.params._id }).exec();

  try {
    if (!user) {
      res.json({ error: "User not found" });
    } else {
      req.body.date = req.body.date ? new Date(req.body.date) : new Date();

      const exercise = new Exercise({
        user_id: user._id,
        username: user.username,
        description: req.body.description,
        duration: req.body.duration,
        date: req.body.date,
      });

      await exercise.save();

      await Log.findOneAndUpdate(
        { _id: user._id },
        {
          $push: {
            log: {
              description: exercise.description,
              duration: exercise.duration,
              date: exercise.date.toDateString(),
            },
          },
        },
        { new: true },
      );

      await Log.findOneAndUpdate(
        { _id: user._id },
        { $inc: { count: 1 } },
        { new: true },
      );

      // Added this in just to complete test 8
      user.description = exercise.description;
      user.duration = exercise.duration;
      user.date = exercise.date;

      userArray.push(user);

      res.json({
        username: user.username,
        description: user.description,
        duration: user.duration,
        date: user.date.toDateString(),
        _id: user._id,
      });
    }
  } catch (err) {
    console.log(err);
  }
});

// GET request to get user's exercise log
app.get("/api/users/:_id/logs", async (req, res) => {
  const { from, to, limit } = req.query;

  const logInfo = await Log.findById({ _id: req.params._id }).exec();
  if (!logInfo) {
    res.send("Could not find log");
    return;
  }

  if (from || to || limit) {
    let dateObj = {};
    if (from) {
      dateObj["$gte"] = new Date(from);
    }
    if (to) {
      dateObj["$lte"] = new Date(to);
    }
    let filter = {
      user_id: req.params._id,
    };
    if (from || to) {
      filter.date = dateObj;
    }

    const exercises = await Exercise.find(filter).limit(limit);

    const log = exercises.map((e) => ({
      description: e.description,
      duration: e.duration,
      date: e.date.toDateString(),
    }));

    // console.log(from + " " + to + " " + limit);
    // console.log("LOG:" + log);
    // console.log("LOGINFO:" + logInfo);
    // console.log({
    //   username: logInfo.username,
    //   count: exercises.length,
    //   _id: logInfo._id,
    //   log: log,
    // });

    res.json({
      username: logInfo.username,
      count: exercises.length,
      _id: logInfo._id,
      log: log,
    });
  } else {
    res.json(logInfo);
  }
});

/*

Below is code from original branch where the functions were solved without using MongoDB or Mongoose, it resulted in a lot of errors but are left here for reference in case

*/

// POST request to create user and _id
// app.post("/api/users", function (req, res) {
//   const user = {};
//   let usrname = req.body.username;
//   let idNum = (Math.random() + 1).toString(36).substring(2);

//   user.username = usrname;
//   user._id = idNum;
//   user.log = [];
//   user.count = 0;

//   userArray.push(user);

//   res.json({ username: usrname, _id: idNum });
// });

// // GET request to get list of all users
// app.get("/api/users", function (req, res) {
//   res.json(userArray);
// });

// // GET request to get exercise logs of a user
// app.get("/api/users/:_id/logs", function (req, res) {
//   let id = "";
//   let user = {};

//   for (let i = 0; i < userArray.length; i++) {
//     if (userArray[i]._id == req.params._id) {
//       id = req.params._id;

//       //testing
//       //console.log(userArray[i]._id);
//       //console.log("params: " + req.params._id)
//       //console.log(id);

//       user = userArray[i];

//       break;
//     }
//   }

//   if (id == "") {
//     //testing
//     //console.log("error: " + id)

//     //res.json({ error: "User ID does not exist" });

//     res.json({
//       count: 0,
//       log: [],
//       username: "",
//       _id: "",
//     });
//   } else {
//     res.json({
//       count: 0,
//       log: [],
//       username: "",
//       _id: "",
//     });
//   }
// });

// app.post("/api/users/:_id/exercises", function (req, res) {
//   let id = "";
//   let user = {};

//   for (let i = 0; i < userArray.length; i++) {
//     if (userArray[i]._id == req.params._id) {
//       id = req.params._id;

//       //testing
//       //console.log(userArray[i]._id);
//       //console.log("params: " + req.params._id)
//       //console.log(id);

//       user = userArray[i];

//       break;
//     }
//   }

//   if (id == "") {
//     //testing
//     //console.log("error: " + id)

//     res.json({ error: "User ID does not exist" });
//   } else if (req.body.description == "") {
//     res.json({ error: "Description is required" });
//   } else if (req.body.duration == "" || parseInt(req.body.duration) == NaN) {
//     res.json({ error: "Duration is required and needs to be an integer" });
//   } else if (req.body.date == "") {
//     /*
//     else if (!isNaN(new Date(req.body.date)) == false && req.body.date != "") {
//     res.json({ error: "Date must be a valid date" });
//   }
//     */
//     let date = new Date();
//     let weekday = date.toLocaleString("en-us", { weekday: "short" });
//     let year = date.getFullYear();
//     let month = date.toLocaleString("default", { month: "short" });
//     let day = date.getDate().toString().padStart(2, "0");

//     let formattedDate = `${weekday} ${month} ${day} ${year}`;

//     user.description = req.body.description;
//     user.duration = Number(req.body.duration);
//     user.date = formattedDate;

//     //testing
//     //console.log(formattedDate);
//     //console.log(userArray);

//     user.log.push({
//       description: user.description,
//       duration: user.duration,
//       date: user.date,
//     });

//     user.count += 1;

//     res.json({
//       username: user.username,
//       description: user.description,
//       duration: user.duration,
//       date: user.date,
//       _id: user._id,
//     });
//   } else {
//     //testing
//     //console.log("else: " + id)
//     let date = new Date(req.body.date);
//     let weekday = date.toLocaleString("en-us", { weekday: "short" });
//     let year = date.getFullYear();
//     let month = date.toLocaleString("default", { month: "short" });
//     let day = date.getDate().toString().padStart(2, "0");

//     let formattedDate = `${weekday} ${month} ${day} ${year}`;

//     //testing
//     //console.log(formattedDate);

//     user.description = req.body.description;
//     user.duration = Number(req.body.duration);
//     user.date = formattedDate;

//     user.log.push({
//       description: user.description,
//       duration: user.duration,
//       date: user.date,
//     });

//     user.count += 1;

//     res.json({
//       username: user.username,
//       description: user.description,
//       duration: user.duration,
//       date: user.date,
//       _id: user._id,
//     });
//   }
// });

const listener = app.listen(process.env.PORT || 3000, () => {
  console.log("Your app is listening on port " + listener.address().port);
});
