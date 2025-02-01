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

const { MongoClient, ServerApiVersion } = require("mongodb");
const uri = process.env.MONGO_URI;

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});

async function run() {
  try {
    // Connect the client to the server	(optional starting in v4.7)
    await client.connect();
    // Send a ping to confirm a successful connection
    await client.db("admin").command({ ping: 1 });
    console.log(
      "Pinged your deployment. You successfully connected to MongoDB!",
    );
  } finally {
    // Ensures that the client will close when you finish/error
    await client.close();
  }
}
run().catch(console.dir);

//variables
const userArray = [];

const userSchema = new Schema({
  username: {
    type: String,
    required: true,
  },
  _id: {
    type: String,
    required: true,
  },
});

const User = mongoose.model("User", userSchema);

app.get("/", (req, res) => {
  res.sendFile(__dirname + "/views/index.html");
});

app.get("/api/hello", function (req, res) {
  res.json({ greeting: "hello API" });
});

// POST request to create user and _id
app.post("/api/users", function (req, res) {
  const user = {};
  let usrname = req.body.username;
  let idNum = (Math.random() + 1).toString(36).substring(2);

  user.username = usrname;
  user._id = idNum;
  user.log = [];
  user.count = 0;

  userArray.push(user);

  res.json({ username: usrname, _id: idNum });
});

// GET request to get list of all users
app.get("/api/users", function (req, res) {
  res.json(userArray);
});

// GET request to get exercise logs of a user
app.get("/api/users/:_id/logs", function (req, res) {
  let id = "";
  let user = {};

  for (let i = 0; i < userArray.length; i++) {
    if (userArray[i]._id == req.params._id) {
      id = req.params._id;

      //testing
      //console.log(userArray[i]._id);
      //console.log("params: " + req.params._id)
      //console.log(id);

      user = userArray[i];

      break;
    }
  }

  if (id == "") {
    //testing
    //console.log("error: " + id)

    //res.json({ error: "User ID does not exist" });

    res.json({
      count: 0,
      log: [],
      username: "",
      _id: "",
    });
  } else {
    res.json({
      count: 0,
      log: [],
      username: "",
      _id: "",
    });
  }
});

app.post("/api/users/:_id/exercises", function (req, res) {
  let id = "";
  let user = {};

  for (let i = 0; i < userArray.length; i++) {
    if (userArray[i]._id == req.params._id) {
      id = req.params._id;

      //testing
      //console.log(userArray[i]._id);
      //console.log("params: " + req.params._id)
      //console.log(id);

      user = userArray[i];

      break;
    }
  }

  if (id == "") {
    //testing
    //console.log("error: " + id)

    res.json({ error: "User ID does not exist" });
  } else if (req.body.description == "") {
    res.json({ error: "Description is required" });
  } else if (req.body.duration == "" || parseInt(req.body.duration) == NaN) {
    res.json({ error: "Duration is required and needs to be an integer" });
  } else if (req.body.date == "") {
    /*
    else if (!isNaN(new Date(req.body.date)) == false && req.body.date != "") {
    res.json({ error: "Date must be a valid date" });
  } 
    */
    let date = new Date();
    let weekday = date.toLocaleString("en-us", { weekday: "short" });
    let year = date.getFullYear();
    let month = date.toLocaleString("default", { month: "short" });
    let day = date.getDate().toString().padStart(2, "0");

    let formattedDate = `${weekday} ${month} ${day} ${year}`;

    user.description = req.body.description;
    user.duration = Number(req.body.duration);
    user.date = formattedDate;

    //testing
    //console.log(formattedDate);
    //console.log(userArray);

    user.log.push({
      description: user.description,
      duration: user.duration,
      date: user.date,
    });

    user.count += 1;

    res.json({
      username: user.username,
      description: user.description,
      duration: user.duration,
      date: user.date,
      _id: user._id,
    });
  } else {
    //testing
    //console.log("else: " + id)
    let date = new Date(req.body.date);
    let weekday = date.toLocaleString("en-us", { weekday: "short" });
    let year = date.getFullYear();
    let month = date.toLocaleString("default", { month: "short" });
    let day = date.getDate().toString().padStart(2, "0");

    let formattedDate = `${weekday} ${month} ${day} ${year}`;

    //testing
    //console.log(formattedDate);

    user.description = req.body.description;
    user.duration = Number(req.body.duration);
    user.date = formattedDate;

    user.log.push({
      description: user.description,
      duration: user.duration,
      date: user.date,
    });

    user.count += 1;

    res.json({
      username: user.username,
      description: user.description,
      duration: user.duration,
      date: user.date,
      _id: user._id,
    });
  }
});

const listener = app.listen(process.env.PORT || 3000, () => {
  console.log("Your app is listening on port " + listener.address().port);
});
