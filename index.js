const express = require("express");
const app = express();
const cors = require("cors");
require("dotenv").config();
const path = require("path");

const apiRoutes = require("./routes/api");

app.use(cors());
app.use(express.static("public"));
app.use(express.urlencoded({ extended: false }));
app.use(express.json());

app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "views/index.html"));
});

app.use("/api", apiRoutes);

const listener = app.listen(process.env.PORT || 3000, () => {
  console.log("Your app is listening on port " + listener.address().port);
});
