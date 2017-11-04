const mongoose = require('mongoose');

var postSchema = new mongoose.Schema({
 title: {
   type: String,
   required: true,
   minlength: 1
 },
 body: {
   type: String,
   required: true,
   minlength: 1
 },
 created: {
   type: Number,
   required: true
 },
 rating: {
   type: Number,
   default: 0,
   required: true
 },
 createdBy: {
   type: String
 },
 url: {
   type: String,
   required: true
 },
 upvotes: [{
   type: String
 }],
 downvotes: [{
     type: String
 }],
 comments: [{
   type: String
 }]
});

var Post = mongoose.model("Post", postSchema);


module.exports = {
  Post
}
