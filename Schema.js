const mongoose = require("mongoose");

const { Schema } = mongoose;

let ExerciseSchema = new Schema({
  userId: { type: String, required: true },
  description: { type: String, required: true },
  duration: { type: Number, required: true },
  date: { type: String, required: true }, // Store as a string
});

let UserSchema = new Schema(
  {
    username: { type: String, required: true },
    log: [ExerciseSchema], // Embedded exercise log
  },
  { versionKey: false }
);

const User = mongoose.model("User", UserSchema);
const Exercise = mongoose.model("Exercise", ExerciseSchema);

module.exports = { User, Exercise };
