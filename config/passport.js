const passport = require('passport')
const LocalStrategy = require('passport-local').Strategy
const FacebookStrategy = require('passport-facebook').Strategy
const bcrypt = require('bcryptjs')
const db = require('../models')
const User = db.User

module.exports = app => {
  app.use(passport.initialize())
  app.use(passport.session())

  passport.use(new LocalStrategy({ usernameField: 'email', passReqToCallback: true }, (req, email, password, done) => {
    const errors = []
    req.session.email = email

    User.findOne({ where: { email } })
      .then(user => {
        if (!user) {
          errors.push('這個 Email 不存在')
          req.session.errors = errors
          return done(null, false, { message: 'That email is not registerd!' })
        }
        return bcrypt.compare(password, user.password)
          .then(isMatch => {
            if (!isMatch) {
              errors.push('Email 或 Password 錯誤')
              req.session.errors = errors
              return done(null, false, { message: 'Email or Password incorrect.' })
            }
            return done(null, user)
          })
      })
      .catch(error => done(error, false))
  }))

  // 設定 Facebook 登入策略
  passport.use(new FacebookStrategy({
    clientID: process.env.FACEBOOK_ID,
    clientSecret: process.env.FACEBOOK_SECRET,
    callbackURL: process.env.FACEBOOK_CALLBACK,
    profileFields: ['email', 'displayName'] // profileFields 設定是和 Facebook 要求開放的資料，我們要了兩種資料
  }, (accessToken, refreshToken, profile, done) => {
    // profile 獲得的臉書資訊
    const { name, email } = profile._json
    User.findOne({ where: { email } })
      .then(user => {
        // 如果 email 已存在資料庫，代表已經註冊過，所以直接回傳 user 資訊
        if (user) {
          return done(null, user)
        }

        // 如果 email 不存在資料庫，則建立新使用者資訊
        const randomPassword = Math.random().toString(36).slice(-8)
        bcrypt.genSalt(10)
          .then(salt => bcrypt.hash(randomPassword, salt))
          .then(hash => {
            User.create({
              email: email,
              password: hash,
              name: name
            })
              .then(user => { return done(null, user) })
              .catch(error => done(error, false))
          })
      })
      .catch(error => done(error, false))
  }))

  passport.serializeUser((user, done) => {
    done(null, user.id)
  })
  passport.deserializeUser((id, done) => {
    User.findByPk(id)
      .then((user) => {
        user = user.toJSON()
        done(null, user)
      })
      .catch(error => done(error, null))
  })
}