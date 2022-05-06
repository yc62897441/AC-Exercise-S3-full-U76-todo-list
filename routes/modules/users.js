const express = require('express')
const router = express.Router()
const passport = require('passport')
const bcrypt = require('bcryptjs')
const db = require('../../models')
const User = db.User

router.get('/login', (req, res) => {
  // 如果有錯誤訊息，或是成功登出訊息，或是使用者輸入之登入email，傳給 views，並清空 session 內存的資訊
  const errors = req.session.errors
  req.session.errors = []

  const logoutMsg = req.session.logoutMsg
  req.session.logoutMsg = ''

  const email = req.session.email
  req.session.email = ''
  
  res.render('login', { errors, logoutMsg, email })
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
        errors.push('這個 Email 已經註冊過了')
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
  delete req.session.email
  delete req.session.passport

  req.session.logoutMsg = '成功登出'

  req.logout()
  res.redirect('/users/login')
})

module.exports = router
