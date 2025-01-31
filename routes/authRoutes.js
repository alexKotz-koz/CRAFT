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
    app.get('/auth/google',
        passport.authenticate('google', {
            scope: ['profile', 'email'],
        })
    );

    app.get('/auth/google/callback',
        passport.authenticate('google',
            (req, res) => {
                res.redirect('/')
            }
        )
    );

    app.get('/auth/generate_username', requireLogin, async (req, res) => {
        let username;
        let existingUser;

        do {
            username = generateUsername();
            existingUser = await User.findOne({ username });
        } while (existingUser);

        res.json({ username });
    });

    /* Future implementation signup
    app.post('/auth/signup', async (req, res) => {
        try {
            const { username, password, email, firstName, lastName, role} = req.body;
            if (!username && !email && !password) {
                return res
                    .status(403)
                    .json({ error: "All Fields are required" });
            }

            const existingUser = await User.findOne({ username });
            if (existingUser) {
                return res
                    .status(409)
                    .json({ error: "username already exists" });
            }
            const salt = await bcrypt.genSalt(10); //default
            const hashed = await bcrypt.hash(password, salt);


            const newUser = new User({
                email,
                username,
                firstName,
                lastName,
                role,
                password: hashed,
            });
            console.log("Auth Route newUSer: ", newUser);
            await newUser.save();
            res.json({ user: newUser });
        } catch (error) {
            res.status(500).send('Internal Server Error', error);
        }
    });*/

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

    app.post('/auth/create_user', async (req, res) => {
        try {
            const { password, email, role } = req.body;
            if (!email && !password) {
                return res
                    .status(403)
                    .json({ error: "All Fields are required" });
            }


            let username;
            let existingUser;

            do {
                username = generateUsername();
                existingUser = await User.findOne({ username });
            } while (existingUser);

            const salt = await bcrypt.genSalt(10); //default
            const hashed = await bcrypt.hash(password, salt);

            const avatar = generateAvatar(username);


            const newUser = new User({
                email,
                username,
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

    app.post('/auth/batch_create_users', requireLogin, requireFacilitatorPermissions, async (req, res,) => {
        const { users } = req.body;

        const session = await mongoose.startSession();
        session.startTransaction();

        try {
            const createdUsers = [];
            for (const user of users) {
                const sale = await bcrypt.genSalt(10);
                const hashedPassword = await bcrypt.hash(user.password, salt);

                const newUser = new User({
                    email: user.email,
                    username: user.username,
                    password: hashedPassword,
                    role: 'participant',
                });

                await newUser.save({ session });
                createdUsers.push(newUser);
            }

            await session.commitTransaction();
            session.endSession();

            res.status(201).send(createdUsers);
        } catch (err) {
            await session.abortTransaction();
            session.endSession();
            res.status(500).send({ error: 'Failed to create users' });
        }

    });

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

    app.get('/auth/logout', requireLogin, (req, res) => {
        req.logout((err) => {
            if (err) {
                return next(err);
            }
            res.redirect('/');
        });
    });

    app.get("/auth/current_user", async (req, res) => {
        const currentUser = req.user;
    
        if (!currentUser) {
            return res.send(null);
        }
    
        const currentUserId = currentUser._id;
    
        try {
            const user = await User.findById(currentUserId)
            .populate('notifications.fromUser')
            .populate('notifications.toUser')
            .populate('notifications.initialResponse.responses')
            .populate('notifications.comment')
            .populate('notifications.task');
            if (!user) {
                return res.status(400).send("Error fetching user");
            }
            res.send(user);
        } catch (err) {
            console.error("Error fetching user: ", err);
            res.status(400).send(err);
        }
    });

    app.get("/auth/all_users", async (req, res) => {
        try {
            const allUsers = await User.find();
            res.send(allUsers);
        } catch (err) {
            return next(err);
        }
    });
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