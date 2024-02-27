const bcrypt = require('bcrypt');
const User = require('../models/user');
const jwt = require('jsonwebtoken');

const validateUserInput = (req) => {
  if (!req.body) {
    return {code: 500, error: "nobody should pass with no body ...." }
  }
  if (!(req.body.password && typeof req.body.password==="string")) {
    return {code: 500, error: "password missing" }
  }
  if (!(req.body.email && typeof req.body.email==="string")) {
    return {code: 500, error: "email missing" }
  }
  if (req.body.email.length<5) {
    return {code: 403, error: "email too short" }
  }
  if (req.body.password.length<4) {
    return {code: 403, error: "password too short" }
  }  if (req.body.password.length>16) {
    return {code: 403, error: "password too long" }
  }
  return {code:200}
}

exports.signup = (req, res, next) => {
  const valid = validateUserInput(req)
  if (valid.code!==200) { return res.status(valid.code).json({message: valid.error}) }
  
  bcrypt.hash(req.body.email+req.body.password, 10)
  .then(hash => {
    const user = new User({
      email: req.body.email,
      password: hash
    });
    user.save()
      .then(() => res.status(201).json({ message: 'user created' }))
      .catch(error => res.status(400).json({message : 'unable to create user', error }));
  })
};

exports.login = (req, res, next) => {
  const valid = validateUserInput(req)
  if (valid.code!==200) { return res.status(valid.code).json(valid.error) }

  User.findOne({ email: req.body.email })
    .then(user => {
      if (!user) {
        return res.status(401).json({ message: 'User not found !' });
      }
      //console.log(req.body.password, user.password)
      bcrypt.compare(req.body.email+req.body.password, user.password)
        .then(valid => {
          if (!valid) {
            return res.status(401).json({ message: 'wrong password !' });
          }
          const SECRET_KEY = process.env.SECRET_KEY;
          const userId = user._id
          const token = jwt.sign( { userId }, SECRET_KEY, { expiresIn: '24h' } )
          res.status(200).json({ message: "signed in", userId, token });
        })
        .catch(error => res.status(500).json({ message: error }));
    })
    .catch(error => res.status(500).json({ message: error }));
};