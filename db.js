const mongoose = require('mongoose');
mongoose.set("strictQuery", false);
const mongoDB="mongodb://localhost:27017/freeCodeCamp"

main().catch((err) => console.log(err));
async function main() {
  await mongoose.connect(mongoDB);
}
const Schema = mongoose.Schema;

const userSchema = new Schema({
    username:{type:String,require:true}
});
const taskSchema = new Schema({
    username:{type:String,require:true},
    description:{type:String},
    duration:{type:String},
    date:{type:String}
});
let User=mongoose.model("User",userSchema);
let Task=mongoose.model("Task",taskSchema);

const saveUser = async (userName)=>{
    var newUser= new User({username:userName});
    let result = await newUser.save();
    return result;
}
const saveTask = async(userID,data)=>{
    var user = await User.findOne({_id:userID});
    var newTask=new Task({username:user.username,description:data.description,duration:data.duration,date:data.date});
    let result = await newTask.save();
    return result;
}


exports.UserModel=User;
exports.saveUser = saveUser;
exports.saveTask = saveTask;