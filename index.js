const express = require('express')
const app = express()
const cors = require('cors')
require('dotenv').config()
const bodyparser = require('body-parser');
//const data = require("./db.js");
const mongoose = require('mongoose');
mongoose.connect("mongodb://localhost:27017/freeCodeCamp");
const Schema = mongoose.Schema;

app.use(cors());
app.use(express.static('public'));
app.use(bodyparser.urlencoded({extended:true}));
app.use(bodyparser.json());

const userSchema = new Schema({
  username:{type:String,require:true}
});
const taskSchema = new Schema({
  user_id:{type:String,require:true},
  description:{type:String},
  duration:{type:Number},
  date:{type:Date}
});
const User=mongoose.model("User",userSchema);
const Task=mongoose.model("Task",taskSchema);

app.get('/', (req, res) => {
  res.sendFile(__dirname + '/views/index.html')
});
app.post('/api/users',async (req,res)=>{
  const newUser = new User({username:req.body.username});
  const result = await newUser.save();
  res.json(result);
});
app.post('/api/users/:_id/exercises',async(req,res)=>{
  const userID= req.params._id;
  const {description,duration,date}=req.body;
  const userInfo=await User.findById(userID);
  const newTask = new Task({user_id:userID,
    description,
    duration,
    date: date ? new Date(date):new Date()
  });
  const result = await newTask.save();
  res.json({
    username:userInfo.username,
    description:result.description,
    duration:result.duration,
    date:result.date.toDateString(),
    _id:userID
  });
});
app.get('/api/users',async (req,res)=>{
  const userLists = await User.find();
  res.json(userLists);
});
app.get('/api/users/:_id/logs',async(req,res)=>{
  const userID=req.params._id;
  const userInfo=await User.findById(userID)
  const {from,to,limit=0}=req.query;
  let dateObj = {};
  if(from){
    dateObj["$gte"]=new Date(from);
  }
  if(to){
    dateObj["$lte"]=new Date(to);
  }
  let filter = {user_id:userID};
  if(from||to){
    filter.date=dateObj;
  }
  const taskLogs=await Task.find(filter).select({_id:0,description:1,duration:1,date:1}).limit(limit)
  const resultLogs=[];
  taskLogs.forEach((e)=>{
    resultLogs.push({description:e.description,duration:e.duration,date:e.date.toDateString()});
  });
  res.json({
    username:userInfo.username,
    count:taskLogs.length,
    _id:userID,
    log:resultLogs
  });
});





const listener = app.listen(process.env.PORT || 3000, () => {
  console.log('Your app is listening on port ' + listener.address().port)
})
