const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const modelUsers = require('../models/modelUsers');

// serialize & deserialize User
passport.serializeUser(function(user, done) {
  done(null, user.id);
});
passport.deserializeUser(async function(id, done) {
  const oUser = await modelUsers.findOne({_id:id});
  done(null, oUser);
});

// local strategy
passport.use('local-login',
  new LocalStrategy({
      usernameField : 'username',
      passwordField : 'password',
      passReqToCallback : true
    },
    async function(req, username, password, done) {
      const oUser = await modelUsers.findOne({username:username}).select({password:1});
      if (oUser && oUser.authenticate(password)){
        return done(null, oUser);
      }
      else {
        req.flash('username', username);
        req.flash('errors', {login:'The username or password is incorrect.'});
        return done(null, false);
      }
    }
  )
);

module.exports = passport;
