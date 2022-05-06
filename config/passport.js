const passport = require('passport')
const LocalStrategy = require('passport-local').Strategy
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