const express = require('express');
const exphbs  = require('express-handlebars');
const bodyParser = require('body-parser');
const expressValidator = require('express-validator');
const _ = require('lodash');
const cookieParser = require('cookie-parser');
const session = require('express-session');
const flash = require('connect-flash');

const {mongoose} = require('./db/mongoose');
const {Post} = require('./db/post');
const {User} = require('./db/user');
const {authenticate} = require('./middleware/authenticate');
const {locals} = require('./middleware/locals');
// const {port} = require('./config');


const post = require('./routes/post');

//app config


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

//CUSTOM MIDDLEWARE

app.use('/post', post);

// ROUTE ROUTE
app.get("/", locals, (req, res) => {
  let data = {
    locals: {
      flash:req.flash(),
      user: res.locals.user
    }
  };

  Post.find().then((posts) => {
    let filteredPosts = [];
    //Remove user data
    posts.forEach(function(post){
      let pickedPost = _.pick(post, ["title", "body", "rating", "url", '_id']);
      pickedPost.title = pickedPost.title.substring(0, 40);
      filteredPosts.push(pickedPost);
    });
    filteredPosts.sort(function(a, b){
      return b.rating - a.rating;
    });
    data.locals.posts = filteredPosts;

    res.render('home', data);
  });
});

// REGISTRATION ROUTES

app.get("/register", locals, (req, res) => {
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
app.get("/login", locals, (req, res) => {
  res.render('login');
});

app.post("/login", (req, res) => {
  var userObj = _.pick(req.body, ['email', 'password']);
  User.findOne({ email: userObj.email }).then((user) => {
      user.comparePassword(userObj.password, function(err, isMatch) {
          if (isMatch) {
            user.generateAuthToken().then((token) => {
              req.session.token = token;
              req.flash('info', 'Successfully logged in!');
              res.redirect("/");
            })
            /* --- --- --- STORE TOKEN IN SESSION --- --- --- */
          } else {
            req.flash('info', 'Log in failed.  Please try again.');
            res.redirect("/");
          }
      });
  }).catch((e) => {
    req.flash('info', 'Log in failed.  Please try again.');
    res.redirect("/");
  });
});

//LOGOUT

app.get('/logout', (req, res) => {
  var token = req.session.token;
  User.findByToken(token).then((user) => {
    user.removeToken(token).then((user) => {
      req.session.token = "";
      req.session.destroy;
      req.flash('info', 'Logged out.');
      res.redirect("/");
    });
  }).catch((e) => {
    req.flash('An unknown error occurred.  Please try again.');
    res.redirect("/");
  });
});

app.listen(process.env.PORT || 3000, () => {
  console.log('Server running on ' + port);
});
