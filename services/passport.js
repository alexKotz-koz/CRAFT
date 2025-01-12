const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const LocalStrategy = require('passport-local');
const mongoose = require('mongoose');
const keys = require('../config/keys');
const bcrypt = require('bcryptjs');

const User = mongoose.model('User');

passport.serializeUser((user, done) => {
  done(null, user.id);
});

passport.deserializeUser((id, done) => {
  User.findById(id).then(user => {
    done(null, user);
  });
});

passport.use(
  new LocalStrategy(
    { usernameField: 'email' }, 
    async (email, password, done) => {
      try {

          const user = await User.findOne({ email });

          if (!user) {
              return done(null, false, { error: "Incorrect email" });
          }
          const passwordsMatch = await bcrypt.compare(
              password,
              user.password
          );

          if (passwordsMatch) {
            return done(null, user);
          } else {
              return done(null, false, { error: "Incorrect password" });
          }
      } catch (err) {
          return done(err);
      }
  })
);
/*passport.use(
  new GoogleStrategy(
    {
      clientID: keys.googleClientID,
      clientSecret: keys.googleClientSecret,
      callbackURL: '/auth/google/callback',
      proxy: true
    },
    async (accessToken, refreshToken, profile, done) => {
      const existingUser = await User.findOne({ googleId: profile.id });

      if (existingUser) {
        return done(null, existingUser);
      }

      const user = await new User({ googleId: profile.id }).save();
      done(null, user);
    }
  )
);*/
