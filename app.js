const express = require('express');
const exphbs  = require('express-handlebars');
const bodyParser = require('body-parser');
const expressValidator = require('express-validator');
const _ = require('lodash');
const cookieParser = require('cookie-parser');
const session = require('express-session');
const flash = require('connect-flash');

const {mongoose} = require('./db/mongoose');
const {User} = require('./db/user');


//app config

const PORT = 3000;

var app = express();

app.engine('handlebars', exphbs({defaultLayout: 'main'}));

app.set('view engine', 'handlebars');

app.use("/public", express.static(__dirname + '/public'));

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

app.use(expressValidator());

app.use(cookieParser());

app.use(session({
  secret: 'mybigsecret',
  resave: true,
  saveUninitialized: true,
}));
app.use(flash());

// GET ROUTES
app.get("/", (req, res) => {
  res.render('home', {locals: {flash: req.flash()}});
});
app.get("/register", (req, res) => {
  res.render('register');
});
// POST ROUTES
app.post("/register", (req, res) => {
  if (req.body.email && req.body.password){
    var userObj = _.pick(req.body, ['email', 'password']);
    var newUser = new User(userObj);
    newUser.save().then(() => {
      req.flash('info', 'Registation was a success!');
      res.redirect("/");
    });
  } else {
    req.flash('info', 'Registration failed.  Please try again.');
    res.send('Missing data!');
  }
});

app.listen(PORT, () => {
  console.log('Server up!');
});
