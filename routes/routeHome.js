const express = require('express');
const router = express.Router();
const util = require('../common/util');
const passport = require('passport');
const modelUsers = require('../models/modelUsers');

// Home
router.get('/', async function (req, res) {
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

router.post('/register', function(req,res) {
    const { username, password, name, passwordConfirmation  } = req.body;
    modelUsers.create({
        username: username,
        password: password,
        name: name,
        passwordConfirmation: passwordConfirmation
    }).then(() => {
        passport.authenticate('local-login', {
            successRedirect: '/',
            failureRedirect: '/login'
        });
        res.status(200).redirect('/login');
    })
    .catch((error) => {
        res.status(500).send({ message: '에러가 발생했습니다: ' + error.message });
    });
});
