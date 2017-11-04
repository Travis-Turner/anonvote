var mongoose = require('mongoose');
mongoose.Promise = global.Promise;
mongoose.connect('mongodb://username:password@ds149335.mlab.com:49335/anonvote');

module.exports = {
  mongoose
}
