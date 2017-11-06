const expect = require('expect');
const request = require('supertest');

var {app} = require('./app');
const {Post} = require('./db/post');
const {User} = require('./db/user');

var newUser = {
  email: 'test@mail.com',
  password: 'password123'
}

beforeEach(function(done){
  User.remove({}).then(() => {
    var user = new User(newUser).save().then((user) => {
      return done();
    }).catch((err) => {
      return done(err);
    });
  }).catch((e) => {
    return done(err);
  })
});

describe('GET /', () => {
  it('should return a list of users', (done) => {
    request(app)
      .get('/')
      .expect(200)
      .end((err, res) => {
        if (err){
          return done(err);
        }
        User.find({}).then((users) => {
          expect(users.length).toBe(1);
        }).catch((err) => {
          return done(err);
        });
        return done();
      });
  });
});

describe('POST /register', () => {
  it('should create a new user', (done) => {
    var newUser = {
      email: 'mail2@mail.com',
      password: 'jenkies1'
    }
    request(app)
      .post('/register')
      .send(newUser)
      .end((err, res) => {
        if (err){
          return done(err);
        }
        User.find({}).then((users) => {
          expect(users.length).toBe(2);
          return done();
        })
        .catch((err) => {
          return done(err)
        })
      });
  });
  it('should NOT create a new user', (done) => {
    var badUser = {
      email: 'goo@mail.org'
    }
    request(app)
      .post('/register')
      .send(badUser)
      .end((err, res) => {
        if (err){
          return done(err);
        }
        User.find({}).then((users) => {
          expect(users.length).toBe(1);
          return done();
        })
        .catch((err) => {
          return done(err);
        })
      })
  })
});
