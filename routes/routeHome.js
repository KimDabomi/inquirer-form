const express = require('express');
const router = express.Router();
const util = require('../common/util');
const passport = require('passport');
const modelUsers = require('../models/modelUsers');

// Home
router.get('/', async function (req, res) {
    // const newUser = await modelUsers.create({
    //     'username': 'cdabomi',
    //     'password': '12',
    //     'name': '싫은데.1..',
    //     'passwordConfirmation': '12'
    // });
    // console.log('newUser', newUser);
    res.render('welcome', {
        test: {"abc" : "mart"}
    });
});


// login
router.get('/login', async function (req, res) {
    if(req.session.passport) {
        res.redirect('/');
    }
    res.render('login', {
        test: { "abc": "mart" }
    });
});

// Post Login
router.post('/login', function (req, res, next) {
        const errors = {};
        let isValid = true;
        console.log(req.body);
        if (!req.body.username) {
            isValid = false;
            errors.username = 'Username is required!';
        }
        if (!req.body.password) {
            isValid = false;
            errors.password = 'Password is required!';
        }

        if (isValid) {
            next();
        } else {
            req.flash('errors', errors);
            res.redirect('/login');
        }
    },
    passport.authenticate('local-login', {
        successRedirect: '/',
        failureRedirect: '/login'
    }
));

// Logout
router.get('/logout', function (req, res) {
    req.logout((a) => res.redirect('/login'));
});

module.exports = router;


// Creat account 
router.get('/register', function(req, res){
    res.render('register', {
        test: { "abc": "mart" }
    });
});

