const express = require('express');
const mongoose = require('mongoose');
const session = require('express-session');
const passport = require('passport');
const bodyParser = require('body-parser');
const path = require('path');
const keys = require('./config/keys');

require('./models/User');
require('./models/Study');
require('./models/StudyTask');
require('./models/StudyResponse');
require('./models/StudyPrompt');
require('./models/Discussion');
require('./models/Comment');
require('./models/Notification');
require('./models/LLMResponseEvaluation');
require('./models/LLMResponseEvaluationResponse');
require('./models/Consent');
require('./services/passport');

mongoose.Promise = global.Promise;
mongoose.connect(keys.mongoURI);

const app = express();

app.use(bodyParser.json());
app.use(
    session({
        secret: keys.cookieKey,
        resave: false,
        saveUninitialized: false,
        cookie: { maxAge: 30 * 24 * 60 * 60 * 1000 }
    })
);
app.use(passport.initialize());
app.use(passport.session());

// API routes MUST come before the catch-all route
require('./routes/studyRoutes')(app);
require('./routes/authRoutes')(app);
require('./routes/discussionRoutes')(app);
require('./routes/llmRERoutes')(app);
require('./routes/consentRoutes')(app);

// Error-handling middleware
app.use((err, req, res, next) => {
    console.error('Server error:', err);
    res.status(500).json({ message: 'Something went wrong!', error: err.message });
});

if (process.env.NODE_ENV === 'production') {
    // Serve static files from the React app build directory
    app.use(express.static(path.join(__dirname, 'client/dist')));
    
    // Use a more specific pattern instead of '*'
    app.get(/^(?!\/api).*/, (req, res) => {
        res.sendFile(path.join(__dirname, 'client/dist', 'index.html'), (err) => {
            if (err) {
                console.error('Error serving file:', err);
                res.status(500).send('Error serving page');
            }
        });
    });
}

const PORT = process.env.PORT || 5001;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
    console.log(`Environment: ${process.env.NODE_ENV}`);
});