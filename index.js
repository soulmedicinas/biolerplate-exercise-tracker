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
  res.json({
    username:result.username,
    description:result.description,
    duration:result.duration,
    date:result.date,
    _id:result._id
  });
});




const listener = app.listen(process.env.PORT || 3000, () => {
  console.log('Your app is listening on port ' + listener.address().port)
})
