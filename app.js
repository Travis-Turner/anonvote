const express = require('express');
const exphbs  = require('express-handlebars');
const bodyParser = require('body-parser');
const expressValidator = require('express-validator');
const _ = require('lodash');
const cookieParser = require('cookie-parser');
const session = require('express-session');
const flash = require('connect-flash');

const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;

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
//express-session
app.use(session({
  secret: 'mybigsecret',
  resave: true,
  saveUninitialized: false,
}));
app.use(flash());

app.get("/secret", (req, res) => {
  console.log(req.session.user);
  if (req.session.user === true){
    res.send('logged in');
  } else {
    res.send('logged out');
  }
});
// ROUTE ROUTE
app.get("/", (req, res) => {
  var data = {
    locals: {
      flash:req.flash()
    }
  };
  if (req.session.user === true){
    data.locals.message = 'testdata';
  }
  res.render('home', data);
});

// REGISTRATION ROUTES

app.get("/register", (req, res) => {
  res.render('register');
});

app.post("/register", (req, res) => {
  if (req.body.email && req.body.password){
    //validate fields
    req.assert('email', 'Is valid email').isEmail();
    req.assert('password', 'Is not empty').notEmpty();

    var errors = req.validationErrors();
    if (errors){
      req.flash('info', 'Registation failed.  Please try again.');
      res.redirect("/");
    }
    //pick relevant properties into seperate object
    var userObj = _.pick(req.body, ['email', 'password']);
    var newUser = new User(userObj);
    //save user
    newUser.save().then(() => {
      req.flash('info', 'Registation was a success!');
      res.redirect("/");
    }).catch((e) => {
      req.flash('info', 'User with that ID already exists.  Please try again.');
      res.redirect("/");
    });
  } else {
    req.flash('info', 'Registration failed.  Please try again.');
    res.redirect("/");
  }
});

//LOGIN ROUTES
app.get("/login", (req, res) => {
  res.render('login');
});

app.post("/login", (req, res) => {
  var userObj = _.pick(req.body, ['email', 'password']);
  User.findOne({ email: userObj.email }).then((user) => {
      user.comparePassword(userObj.password, function(err, isMatch) {
          if (isMatch) {
            req.session.user = true;
            req.flash('info', 'Successfully logged in!');
            res.redirect("/");
          } else {
            req.flash('info', 'Log in failed.  Please try again.');
            res.redirect("/login");
          }
      });
  }).catch((e) => {
    req.flash('An unknown error occurred.  Please try again.');
    res.redirect("/");
  });
});

//LOGOUT

app.get('/logout', (req, res) => {
  req.session.user = false;
  req.flash('info', 'Logged out.');
  res.redirect("/");
});

app.listen(PORT, () => {
  console.log('Server up!');
});
