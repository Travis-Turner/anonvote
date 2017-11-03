var express = require('express')
var router = express.Router()

const expressValidator = require('express-validator');
const _ = require('lodash');

const {User} = require('./../db/user');
const {Post} = require('./../db/post');
const {authenticate} = require('./../middleware/authenticate');
const {locals} = require('./../middleware/locals');
const {mongoose} = require("./../db/mongoose");

router.use("/public", express.static(__dirname + '/public'));

router.use(function timeLog (req, res, next) {
  next()
});

router.get('/', authenticate, locals, function (req, res) {
  res.render('post');
});

router.post('/', authenticate, function (req, res) {
  var post = _.pick(req.body, ['title', 'body', '_id']);
  if (!post.url){
    post.url = 'https://image.flaticon.com/icons/svg/78/78373.svg';
  }
  var newPost = new Post(post);
  var token = req.session.token;
  User.findByToken(token).then((user) => {
    //Initialize post data
    var user_id = user._id.toHexString();
    newPost.createdBy = user_id;
    newPost.upvotes.push(user_id);
    newPost.rating = 1;
    newPost.created = new Date().getTime();
    newPost.save()
    .then((post) => {
      req.flash('info', 'Post submitted!');
      res.redirect('/');
  }).catch((e) => {
    console.log(e);
    req.flash('info', 'Post failed.  Please try again.');
    res.redirect('/');
    });
  });
});

router.get('/:id', authenticate, locals, (req, res) => {
  Post.findOne({'_id': req.params.id}).then((post) => {
      let pickedPost = _.pick(post, ["title", "body", "rating", "url", '_id']);

    res.render('individualpost', pickedPost);
  })
  .catch((e) => {
    req.flash('info', 'Post not found!');
    res.redirect("/");
  });

});

module.exports = router
