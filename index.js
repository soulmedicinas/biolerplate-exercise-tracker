var express = require('express');
var cors = require('cors');
require('dotenv').config()

var app = express();

// connect to MongoDB:
const mongoose = require('mongoose');
mongoose.connect(process.env.MONGO_URI, { useNewParser: true, useUnifiedTopology: true })
.then(() => console.log("MongoDB connected"))
.catch(err => console.error(err));

const fileSchema = new mongoose.Schema({
  name: String,
    type: String,
    size: Number,
    uploadedAt: { type: Date, default: Date.now }
  });

module.exports = mongoose.model('File', fileSchema);

app.use(cors());
app.use(express.static('public'));
app.use(express.urlencoded({ extended: true }));

const multer = require('multer');

// Configure multer storage (store in memory or disk):
const storage = multer.memoryStorage(); // can use diskStorage for saving to disk
const upload = multer({ storage: storage });

app.use(cors());
app.use('/public', express.static(process.cwd() + '/public'));

app.get('/', function (req, res) {
  res.sendFile(process.cwd() + '/views/index.html');
});

// Create a POST route to handle file upload:
app.post('/api/fileanalyse', upload.single('upfile'), async (req, res) => {
  if (!req.file) return res.status(400).json({ error: 'No file uploaded' });

  const { originalname, mimetype, size } = req.file;

  const fileData = new File({
    name: originalname,
    type: mimetype,
    size
  });

  await fileData.save();

  res.json({
    name: originalname,
    type: mimetype,
    size
  });
});

const port = process.env.PORT || 3000;
app.listen(port, function () {
  console.log('Your app is listening on port ' + port)
});
