const express = require('express');
const router = express.Router();

const passport = require('passport');
const { ensureAuthenticated } = require('../config/auth')
    //User Model
const User = require('../models/User');

//login page
router.get('/login', (req, res, next) => {
    res.render('login');
});

//registeration page
router.get('/register', (req, res, next) => {
    res.render('register');
});

//Register handle
router.post('/register', (req, res, next) => {
    const { name, email, password, password2 } = req.body;
    let errors = [];
    if (!name || !email || !password || !password2) {
        errors.push({ msg: 'Please enter all fields' });
    }
    if (password != password2) {
        errors.push({ msg: 'Passwords do not match' });
    }
    if (password.length < 4) {
        errors.push({ msg: 'Password must be at least 4 characters' });
    }
    if (errors.length > 0) {
        res.render('register', {
            errors,
            name,
            email,
            password,
            password2
        });
    } else {
        User.findOne({ email: email }).then(user => {
            if (user) {
                errors.push({ msg: 'Email already exists' });
                res.render('register', {
                    errors,
                    name,
                    email,
                    password,
                    password2
                });
            } else {
                const newUser = new User({
                    name,
                    email,
                    password
                });
                newUser.save()
                    .then(user => {
                        req.flash(
                            'success_msg',
                            'You are now registered and can log in'
                        );
                        res.redirect('/login');
                    }).catch(err => console.log(err));
            }
        });
    }
});

// Login Handle
router.post('/login', (req, res, next) => {
    passport.authenticate('local', {
        successRedirect: '/dashboard',
        failureRedirect: '/login',
        failureFlash: true
    })(req, res, next);
});

router.get('/dashboard', (req, res, next) => {
    res.render('dashboard');
});

// Logout Handle
router.get('/logout', (req, res) => {
    req.logout();
    req.flash('success_msg', 'You are logged out');
    res.redirect('/login');
});
module.exports = router;