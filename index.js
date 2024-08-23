const express = require('express')
const app = express()
const cors = require('cors')
require('dotenv').config()
const bodyparser = require('body-parser');
const data = require("./db.js");

app.use(cors());
app.use(express.static('public'));
app.use(bodyparser.urlencoded({extended:true}));
app.use(bodyparser.json());

app.get('/', (req, res) => {
  res.sendFile(__dirname + '/views/index.html')
});
app.post('/api/users',async (req,res)=>{
  var userName=req.body.username;
  let result = await data.saveUser(userName);
  res.json({username:result.username,_id:result._id});
});
app.post('/api/users/:_id/exercises',async(req,res)=>{
  let userid=req.params._id;
  let result = await data.saveTask(userid,req.body);
  let resDate= new Date(result.date).toDateString();
  res.json({
    _id:userid,
    username:result.username,
    date:resDate,
    duration:result.duration,
    description:result.description
  });
});
app.get('/api/users',async (req,res)=>{
  let users = await data.getUserList();
  res.json(users);
});
app.get('/api/users/:usrID/logs',async(req,res)=>{
  const userID=req.params.usrID;
  const {from,to,limit=0}=req.query;
  if(from && to){
    console.log(from+" - "+to+"-"+limit+" user: "+userID);
    let result = await data.getUserLogsWithParam(userID,from,to,limit);
    res.json(result);
  }else{
    let userLogs=await data.getUserLogs(userID);
    res.json(userLogs);
  }
});




const listener = app.listen(process.env.PORT || 3000, () => {
  console.log('Your app is listening on port ' + listener.address().port)
})
