const passport = require('passport');
const mongoose = require('mongoose');
const User = mongoose.model('users');
const bcrypt = require('bcryptjs');
const requireLogin = require('../middlewares/requireLogin');
const getRandomWords = require('./usernameGeneration/generateUsername');

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
        let userName;
        let existingUser;

        do {
            userName = generateUsername();
            console.log("Generated Username: ", userName);
            existingUser = await User.findOne({ userName });
        } while (existingUser);

        res.json({ userName });
    });

    /* Future implementation signup
    app.post('/auth/signup', async (req, res) => {
        try {
            const { userName, password, email, firstName, lastName, role} = req.body;
            if (!userName && !email && !password) {
                return res
                    .status(403)
                    .json({ error: "All Fields are required" });
            }

            const existingUser = await User.findOne({ userName });
            if (existingUser) {
                return res
                    .status(409)
                    .json({ error: "Username already exists" });
            }
            const salt = await bcrypt.genSalt(10); //default
            const hashed = await bcrypt.hash(password, salt);


            const newUser = new User({
                email,
                userName,
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
        console.log("req.body", req.body);

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

            res.json({ message: "Password updated successfully" });
        } catch (error) {
            console.error("Error updating password:", error);
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


            let userName;
            let existingUser;

            do {
                userName = generateUsername();
                console.log("Generated Username: ", userName);
                existingUser = await User.findOne({ userName });
            } while (existingUser);

            const salt = await bcrypt.genSalt(10); //default
            const hashed = await bcrypt.hash(password, salt);


            const newUser = new User({
                email,
                userName,
                role,
                password: hashed,
            });
            console.log("Auth Route newUSer: ", newUser);
            await newUser.save();
            res.json({ user: newUser });
        } catch (error) {
            res.status(500).send('Internal Server Error', error);
        }
    });

    app.post('/auth/batch_create_users', requireLogin, async (req, res,) => {
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
                    userName: user.userName,
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

    app.get("/auth/current_user", (req, res) => {
        console.log(req.user);
        res.send(req.user);
    });

    app.get("/auth/all_users", async (req, res) => {
        try {
            const allUsers = await User.find();
            res.send(allUsers);
        } catch (err) {
            return next(err);
        }
    });
};