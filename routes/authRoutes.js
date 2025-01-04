const passport = require('passport');
const mongoose = require('mongoose');
const User = mongoose.model('users');
const bcrypt = require('bcryptjs');

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

    app.post('/auth/signup', async (req, res) => {
        try {
            const { userName, password, confirmPassword, email, firstName, lastName, role} = req.body;
            if (!userName && !email && !password) {
                return res
                    .status(403)
                    .json({ error: "All Fields are required" });
            }
            /* TODO
            if (confirmpassword !== password) {
                return res
                    .status(403)
                    .render("register", { error: "Password do not match" });
            }*/
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
            await newUser.save();
            res.json({ user: newUser });
        } catch (error) {
            res.status(500).send('Internal Server Error', error);
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


    app.get('/auth/logout', (req, res) => {
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
};