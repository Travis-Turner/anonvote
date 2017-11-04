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
      return res.redirect('/');
  }).catch((e) => {
    console.log(e);
    req.flash('info', 'Post failed.  Please try again.');
    return res.redirect('/');
    });
  });
});

router.get('/:id', authenticate, locals, (req, res) => {
  Post.findOne({'_id': req.params.id}).then((post) => {
      let pickedPost = _.pick(post, ["title", "body", "rating", "url", '_id']);

    return res.render('individualpost', pickedPost);
  })
  .catch((e) => {
    req.flash('info', 'Post not found!');
    return res.redirect("/");
  });
});

router.post('/:id/upvote', authenticate, (req, res) => {
  Post.findOne({'_id': req.params.id}).then((post) => {
    User.findByToken(req.session.token).then((user) => {
      user_id = user._id.toHexString();
      if (post.upvotes.includes(user_id)){
        req.flash('info', "You can't vote that post any higher");
        return res.redirect('/');
      }
      if (post.downvotes.includes(user_id)){
        var index = post.downvotes.indexOf(user_id);
        post.downvotes.splice(index, 1);
      }
      post.upvotes.push(user_id);
      post.rating++;
      post.save();
      req.flash('info', 'Vote submitted.');
      return res.redirect('/');
    });
  });
});

router.post('/:id/downvote', authenticate, (req, res) => {
  Post.findOne({'_id': req.params.id}).then((post) => {
    User.findByToken(req.session.token).then((user) => {
      user_id = user._id.toHexString();
      if (post.downvotes.includes(user_id)){
        req.flash('info', "You can't vote that post any lower");
        return res.redirect('/');
      }
      if (post.upvotes.includes(user_id)){
        var index = post.upvotes.indexOf(user_id);
        post.upvotes.splice(index, 1);
      }
      post.downvotes.push(user_id);
      post.rating--;
      post.save();
      req.flash('info', 'Vote submitted.');
      return res.redirect('/');
    });
  });
});

module.exports = router
