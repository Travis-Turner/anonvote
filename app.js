const express = require('express');
const exphbs  = require('express-handlebars');
const bodyParser = require('body-parser');
const expressValidator = require('express-validator');
const mongoose = require('mongoose');

//mongoose setup

mongoose.Promise = global.Promise;
mongoose.connect("mongodb://localhost:27017/AnonVote");

var userSchema = new mongoose.Schema({
 email: String,
 password: String
});

var User = mongoose.model("User", userSchema);

//app config

const PORT = 3000;

var app = express();

app.engine('handlebars', exphbs({defaultLayout: 'main'}));

app.set('view engine', 'handlebars');

app.use("/public", express.static(__dirname + '/public'));

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

app.use(expressValidator());

// GET ROUTES
app.get("/", (req, res) => {
  res.render('home');
});
app.get("/register", (req, res) => {
  res.render('register');
});
// POST ROUTES
app.post("/register", (req, res) => {
  if (req.body.email && req.body.password){
    var newUser = new User(req.body);
    newUser.save().then(() => {
      res.send(newUser);
    });
  } else {
    res.send('Missing data!');
  }
});

app.listen(PORT, () => {
  console.log('Server up!');
});
