const userService = require("../services/userService");

exports.createUser = (req, res) => {
  const username = req.body.username?.trim();
  if (!username) return res.status(400).send("Username is required");

  userService.registerUser(username, (err, user) => {
    if (err?.message.includes("UNIQUE constraint")) {
      return res.status(400).json({ error: "Username must be unique" });
    }
    if (err) return res.status(500).send("Database error");
    res.json(user);
  });
};

exports.getAllUsers = (req, res) => {
  userService.getUsers((err, users) => {
    if (err) return res.status(500).send("Failed to retrieve users");
    res.json(users);
  });
};

exports.addExercise = (req, res) => {
  userService.addExerciseToUser(req.params._id, req.body, (err, exercise) => {
    if (err?.message === "User not found")
      return res.status(404).send("User not found");
    if (err?.message.includes("Invalid"))
      return res.status(400).send(err.message);
    if (err) return res.status(500).send("Failed to add exercise");
    res.json(exercise);
  });
};

exports.getLogs = (req, res) => {
  const { from, to, limit } = req.query;
  userService.getUserLogs(req.params._id, from, to, limit, (err, result) => {
    if (err?.message === "User not found")
      return res.status(404).send("User not found");
    if (err) return res.status(500).send("Failed to get logs");
    res.json(result);
  });
};
