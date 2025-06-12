const { v4: uuidv4 } = require("uuid");
const userModel = require("../models/userModel");

exports.registerUser = (username, callback) => {
  const id = uuidv4();
  userModel.createUser(id, username, (err) => {
    if (err) return callback(err);
    callback(null, { _id: id, username });
  });
};

exports.getUsers = (callback) => {
  userModel.getAllUsers(callback);
};

exports.addExerciseToUser = (userId, data, callback) => {
  const { description, duration, date } = data;
  const parsedDuration = parseInt(duration);
  if (!description || isNaN(parsedDuration) || parsedDuration <= 0) {
    return callback(new Error("Invalid input"));
  }

  const dateObj = date ? new Date(date) : new Date();
  if (isNaN(dateObj.getTime())) {
    return callback(new Error("Invalid date"));
  }

  const isoDate = dateObj.toISOString().split("T")[0];

  userModel.findUserById(userId, (err, user) => {
    if (err || !user) return callback(new Error("User not found"));

    const exerciseId = uuidv4();

    userModel.createExercise(
      exerciseId,
      userId,
      description,
      parsedDuration,
      isoDate,
      (err2) => {
        if (err2) return callback(err2);

        callback(null, {
          _id: user.id,
          username: user.username,
          description,
          duration: parsedDuration,
          date: dateObj.toDateString(),
        });
      }
    );
  });
};

exports.getUserLogs = (userId, from, to, limit, callback) => {
  userModel.findUserById(userId, (err, user) => {
    if (err || !user) return callback(new Error("User not found"));

    const fromISO = from ? new Date(from).toISOString().split("T")[0] : null;
    const toISO = to ? new Date(to).toISOString().split("T")[0] : null;

    userModel.getUserExercises(userId, fromISO, toISO, limit, (err2, log) => {
      if (err2) return callback(err2);

      const count = log.length;

      const formattedLog = log.map((entry) => ({
        description: entry.description,
        duration: entry.duration,
        date: new Date(entry.date).toDateString(),
      }));

      callback(null, {
        _id: user.id,
        username: user.username,
        count,
        log: formattedLog,
      });
    });
  });
};
