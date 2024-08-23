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
    duration:{type:Number},
    date:{type:Date}
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
    if(data.date===undefined){
        var newdate = new Date();
    }else{
        var newdate = new Date(data.date);
    }
    //console.log(data.date);
    var newDuration = Number(data.duration);
    var newTask=new Task({
        username:user.username,
        description:data.description,
        duration:newDuration,
        date:newdate});
    let result = await newTask.save();
    return result;
}
const getUserList = async()=>{
    const data = await User.find();
    //console.log(data);
    return data;
}
const getUserLogs=async(userID)=>{
    const userData=await User.findById(userID);
    const userLogs=await Task.find({username:userData.username}).select({_id:0,description:1,duration:1,date:1}).exec();
    let count = userLogs.length;
    let logResult=[];
    userLogs.forEach((e)=>{
        d = new Date(e.date);
        logResult.push({description:e.description,duration:e.duration,date:d.toDateString()});
    });
    let result = {username:userData.username,count:count,_id:userData._id,log:logResult};


    return result;
}
const getUserLogsWithParam=async(userID,from,to,limit)=>{
    const userData=await User.findById(userID);
    const userLogs=await Task.find({username:userData.username}).limit(Number.parseInt(limit)).select({_id:0,description:1,duration:1,date:1}).exec();
    
    let logResult=[];
    userLogs.forEach((e)=>{
        d = new Date(e.date);
        logResult.push({description:e.description,duration:e.duration,date:d.toDateString()});
    });
    finalResult=[]
    logResult.forEach((e)=>{
        if(checkDate(from,to,e.date)){
            finalResult.push(e);
        }
    });
    let count = finalResult.length;
    let result = {username:userData.username,count:count,_id:userData._id,log:finalResult};
    return result;
}
function checkDate(from,to,d){
    const fromDate = new Date(from);
    const toDate = new Date(to);
    const checkDate = new Date(d);

    return checkDate >= fromDate && checkDate <= toDate;
}



exports.UserModel=User;
exports.saveUser = saveUser;
exports.saveTask = saveTask;
exports.getUserList=getUserList;
exports.getUserLogs = getUserLogs;
exports.getUserLogsWithParam = getUserLogsWithParam;