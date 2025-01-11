const express = require('express');
const mongoose = require('mongoose');
const session = require('express-session');
const passport = require('passport');
const bodyParser = require('body-parser');
const keys = require('./config/keys');
require('./models/User');
require('./models/Study');
require('./models/StudyResponse');
require('./services/passport');

mongoose.Promise = global.Promise;
mongoose.connect(keys.mongoURI);

const app = express();

app.use(bodyParser.json());
app.use(
    session({
      secret: keys.cookieKey,
      resave: false, // Forces the session to be saved back to the session store, even if it was never modified during the request
      saveUninitialized: false, // Forces a session that is "unitinitialized" to be saved to the store
      cookie: { maxAge: 30 * 24 * 60 * 60 * 1000 } // 30 days
    })
  );
app.use(passport.initialize()); // Passport initialize session communication via cookies
app.use(passport.session()); 

require('./routes/studyRoutes')(app);
require('./routes/authRoutes')(app);
require('./routes/discussionRoutes')(app);

// Error-handling middleware
app.use((err, req, res, next) => {
    res.status(500).json({ message: 'Something went wrong!', error: err });
  });

if (process.env.NODE_ENV === 'production') {
    // Express will serve up production assets (main.js, main.css)
    app.use(express.static('client/dist'));

    // Express will serve up the index.html file if it doesn't recognize the route
    const path = require('path');
    app.get('*', (req, res) => {
    res.sendFile(path.resolve(__dirname, 'client', 'dist', 'index.html'));
    });
}

const PORT = process.env.PORT || 5001;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});