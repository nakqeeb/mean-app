const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const User = require('../models/user');

exports.createUser =  (req, res, next) => {
  bcrypt.hash(req.body.password, 10) // the second arg is called salting round. explination in lecture 99
    .then(hash => {
      const user = new User({
        email: req.body.email,
        password: hash
      });
      user.save().then(result => {
        res.status(201).json({
          message: 'User created',
          result: result
        });
      }).catch(err => { // err is a default err message set by mongooose since we use (uniqueValidator) in the user.js. So the default message will be somthing like "User validation failed: email: Error, expected `email` to be unique. Value: `test@test.com`"
        res.status(500).json({
          message: 'Invalid authentication credentials!'
        });
      });
    });
}

exports.userLogin = (req, res, next) => {
  let fetchedUser;
  User.findOne({ email: req.body.email })
    .then(user => {
      /* if (!user) { // If I use this approach I may encounter Error [ERR_HTTP_HEADERS_SENT] when login using non existant email
        return res.status(401).json({
          message: 'Auth failed'
        });
      } */
      if (!user) { // So I use this approach to avoid that error (Error [ERR_HTTP_HEADERS_SENT]). I got it from Q&A answered by Max
        throw new Error('Auth failed');
      }
      fetchedUser = user;
      return bcrypt.compare(req.body.password, user.password);
    })
    .then(result => {
      if (!result) { // result here will return true if the entring password and the user password are match, otherwise it will return false if they dont match
        return res.status(401).json({
          message: 'Auth failed'
        });
      }
      const token = jwt.sign(  // if you have any doubt, refer to lecture 102
        {email: fetchedUser.email, userId: fetchedUser._id},
        process.env.JWT_KEY,
        { expiresIn: '1h' }
      );
      res.status(200).json({
        token: token,
        expiresIn: 3600,
        userId: fetchedUser._id // lecture 118
      });
    })
    .catch(err => {
      return res.status(401).json({
        message: 'Invalid authentication credentials!'
      });
    });
}
