const express = require('express')
const router = express.Router()
const passport = require('passport')
const bcrypt = require('bcryptjs')
const db = require('../../models')
const User = db.User

router.get('/login', (req, res) => {
  res.render('login')
})

router.post('/login', passport.authenticate('local', {
  successRedirect: '/',
  failureRedirect: '/users/login'
}))

router.get('/register', (req, res) => {
  res.render('register')
})

router.post('/register', (req, res) => {
  const { name, email, password, confirmPassword } = req.body
  const errors = []

  if (!name || !email || !password || !confirmPassword) {
    errors.push('Name, Email, Password, ConfirmPassword 均為必填項目')
  }
  if (password !== confirmPassword) {
    errors.push('Password, ConfirmPassword 不一致')
  }
  if (errors.length > 0) {
    return res.render('register', { name, email, password, confirmPassword, errors })
  }

  User.findOne({ where: { email } })
    .then(user => {
      if (user) {
        errors.push('User already exists')
        return res.render('register', {
          name,
          email,
          password,
          confirmPassword,
          errors
        })
      }
      return bcrypt.genSalt(10)
        .then(salt => bcrypt.hash(password, salt))
        .then(hash => User.create({
          name: name,
          email: email,
          password: hash
        }))
        .then(() => { res.redirect('/') })
        .catch(error => console.log(error))
    })
})

router.get('/logout', (req, res) => {
  res.send('/users/login')
})

module.exports = router
