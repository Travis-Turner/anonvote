const {User} = require('./../db/user');


var authenticate = function (req, res, next) {
  var token = req.session.token;
  User.findByToken(token)
    .then((user) => {
      if (!user) {
        return Promise.reject('Could not find that user');
      }
      next();
    })
    .catch((e) => {
      res.status(401).send();
    });
}

module.exports = {authenticate};
