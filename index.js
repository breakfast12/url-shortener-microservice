require('dotenv').config();
const mongoose = require('mongoose');
const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const shortId = require('shortid');
const app = express();

// Basic Configuration
const port = process.env.PORT || 3000;

app.use(cors());

app.use('/public', express.static(`${process.cwd()}/public`));
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

app.get('/', function(req, res) {
  res.sendFile(process.cwd() + '/views/index.html');
});

// Your first API endpoint
app.get('/api/hello', function(req, res) {
  res.json({ greeting: 'hello API' });
});

// URL Shortener Microservice
const connection = mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true
});

const urlSchema = new mongoose.Schema({
  original_url: String,
  short_url: String
});

const Url = mongoose.model('Url', urlSchema);

app.post('/api/shorturl', (req, res) => {
  var url = req.body.url;
  var urlGenerate = shortId.generate();

  var postURL = new Url({
    original_url: url,
    short_url: urlGenerate
  });

  postURL.save((err, data) => {
    if (err) {
      return console.log(err);
    }
    done(null, data)
  });

  res.json({ 
    original_url: url, 
    short_url: urlGenerate
  });
});

app.listen(port, function() {
  console.log(`Listening on port ${port}`);
});
