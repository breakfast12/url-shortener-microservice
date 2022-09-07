require('dotenv').config();
const mongoose = require('mongoose');
const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const shortId = require('shortid');
const validUrl = require('valid-url');
const app = express();

// Basic Configuration
const port = process.env.PORT || 3000;
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

app.use(cors());

app.use('/public', express.static(`${process.cwd()}/public`));

mongoose 
 .connect(process.env.MONGO_URI, {
        useNewUrlParser: true,
        useUnifiedTopology: true})   
 .then(() => console.log("Database connected!"))
 .catch(err => console.log(err));

app.get('/', function(req, res) {
  res.sendFile(process.cwd() + '/views/index.html');
});

// Your first API endpoint
app.get('/api/hello', function(req, res) {
  res.json({ greeting: 'hello API' });
});

// URL Shortener Microservice
const urlSchema = new mongoose.Schema({
  original_url: {
    type: String,
    required: true
  },
  short_url: String
});

const Url = mongoose.model('Url', urlSchema);

app.post('/api/shorturl', (req, res) => {
  var url = req.body.url;
  var urlGenerate = shortId.generate();

  if (!validUrl.isWebUri(url)) {
    res.json({ error: 'invalid url' });
  } else {
    var URL = new Url({
      original_url: url,
      short_url: urlGenerate
    });
  
    URL.save((err, data) => {
      if (err) {
        res.send({ error: 'invalid URL' });
      } else {
        res.send({ original_url: data.original_url, short_url: data.short_url });
      }
    });
  }
});

app.get('/api/shorturl/:short_url', (req, res) => {
  var shortUrl = req.params.short_url;
  Url.find({short_url: shortUrl}, (err, data) => {
    if (err) {
      res.send({ error: 'invalid URL' });
    } else {
      res.redirect(data[0].original_url);
    }
  })
});

app.listen(port, function() {
  console.log(`Listening on port ${port}`);
});
