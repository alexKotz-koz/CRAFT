const passport = require('passport');
const mongoose = require('mongoose');
const User = mongoose.model('User');
const bcrypt = require('bcryptjs');
const requireLogin = require('../middlewares/requireLogin');
const requireFacilitatorPermissions = require('../middlewares/requireFacilitatorPermissions');
const getRandomWords = require('./usernameGeneration/generateUsername');
const generateAvatar = require('./usernameGeneration/generateAvatar');

function generateUsername() {
    const { adjective, noun } = getRandomWords();
    return `${adjective}-${noun}`;
}

module.exports = (app) => {
    // API: fetchUsername, useLazyFetchUsernameQuery
    // Used in: StudyParticipants.jsx
    app.get('/auth/generate_username', requireLogin, async (req, res) => {
        let username;
        let existingUser;

        do {
            username = generateUsername();
            //console.log("/auth/generate_username: ", username);
            existingUser = await User.findOne({ username });
        } while (existingUser);

        res.json({ username });
    });

    // API: passwordReset
    // Used in: PasswordReset.jsx
    app.post('/auth/password_reset', async (req, res) => {
        const { email, currentPassword, newPassword } = req.body;
        try {
            const user = await User.findOne({ email });
            if (!user) {
                return res.status(404).json({ error: "User not found" });
            }

            const passwordsMatch = await bcrypt.compare(currentPassword, user.password);
            if (!passwordsMatch) {
                return res.status(400).json({ error: "Incorrect current password" });
            }

            const salt = await bcrypt.genSalt(10);
            const hashedNewPassword = await bcrypt.hash(newPassword, salt);

            user.password = hashedNewPassword;
            await user.save();

            res.json({ error: "Password updated successfully" });
        } catch (error) {
            res.status(500).json({ error: "Internal server error" });
        }
    });

    // API: createUser
    // Used in: SignUp.jsx, StudyNewWizard.jsx
    app.post('/auth/create_user', async (req, res) => {
        try {
            const { firstName, lastName, password, email, role } = req.body;
            let username = req.body.username;
            if (!email && !password) {
                return res
                    .status(403)
                    .json({ error: "All Fields are required" });
            }


            let existingUser;

            if (username === "") {
                do {
                    username = generateUsername();
                    existingUser = await User.findOne({ username });
                } while (existingUser);
            }


            const salt = await bcrypt.genSalt(10); //default
            const hashed = await bcrypt.hash(password, salt);

            const avatar = generateAvatar(username);


            const newUser = new User({
                email,
                username,
                firstName,
                lastName,
                role,
                password: hashed,
                avatar,
            });
            await newUser.save();
            res.json({ user: newUser });
        } catch (error) {
            console.error("Error creating user: ", error)
            res.status(500).send('Internal Server Error', error);
        }
    });

    // API: loginUser
    // Used in: Login.jsx
    app.post('/auth/login', (req, res, next) => {
        passport.authenticate('local', (err, user, info) => {
            if (err) {
                return next(err);
            }
            if (!user) {
                return next(info);
            }
            req.logIn(user, (err) => {
                if (err) {
                    return next(err);
                }
                return res.json({ message: 'Authenticated successfully', user });
            });
        })(req, res, next);
    });

    // API: 
    // Used in:
    app.get('/auth/logout', requireLogin, (req, res) => {
        req.logout((err) => {
            if (err) {
                return next(err);
            }
            res.redirect('/');
        });
    });

    // API: fetchUser
    // Used in: DiscussionBoard.jsx, ClarificationModal.jsx, App.jsx, Header.jsx, Home.jsx
    app.get("/auth/current_user", async (req, res) => {
        const currentUser = req.user;

        if (!currentUser) {
            return res.send(null);
        }

        const currentUserId = currentUser._id;

        try {
            const user = await User.findById(currentUserId)
                .populate({
                    path: 'notifications',
                    model: 'Notification',
                    populate: [
                        { path: 'toUser', model: 'User' },
                        { path: 'fromUser', model: 'User' },
                        { path: 'task', model: 'StudyTask' }, // Assuming you have a Task model
                    ]
                });
            if (!user) {
                return res.status(400).send("Error fetching user");
            }
            res.send(user);
        } catch (err) {
            console.error("Error fetching user: ", err);
            res.status(400).send(err);
        }
    });

    // API: 
    // Used in:
    app.get("/auth/all_users", async (req, res) => {
        try {
            const allUsers = await User.find();
            res.send(allUsers);
        } catch (err) {
            return next(err);
        }
    });

    // API: useLazyCheckUsernameAvailabilityQuery
    // Used in: StudyParticipants.jsx
    app.post('/auth/check_user', async (req, res) => {
        const { checkUser } = req.body;
        try {
            const userExists = await User.findOne({ email: checkUser.email });

            if (userExists) {
                return res.status(200).send({ exists: true });
            } else {
                return res.status(200).send({ exists: false });
            }
        } catch (err) {
            console.error("Error checking user existence:", err);
            return res.status(500).send({ error: "Internal server error" });
        }
    });
};