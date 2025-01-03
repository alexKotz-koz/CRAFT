const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const LocalStrategy = require('passport-local');
const mongoose = require('mongoose');
const keys = require('../config/keys');
const bcrypt = require('bcryptjs');

const User = mongoose.model('users');

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
    { usernameField: 'userName' }, 
    async (userName, password, done) => {
      try {
          // Find the user by username in the database
          const user = await User.findOne({ userName });
          // If the user does not exist, return an error
          if (!user) {
              return done(null, false, { error: "Incorrect username" });
          }

          // Compare the provided password with the 
          // hashed password in the database
          const passwordsMatch = await bcrypt.compare(
              password,
              user.password
          );

          // If the passwords match, return the user object
          if (passwordsMatch) {
            return done(null, user);
          } else {
              // If the passwords don't match, return an error
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
