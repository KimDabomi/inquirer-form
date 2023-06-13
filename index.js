const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const flash = require('connect-flash');
require('dotenv').config();
const util = require('./common/util');
const session = require('express-session');
const passport = require('./config/passport');
const MongoStore = require('connect-mongo');
const methodOverride = require('method-override');


const app = express();

mongoose.connect('mongodb+srv://cdabomi60:cdabomi60@cluster0.gtjcyjz.mongodb.net/calllink_admin?retryWrites=true&w=majority');
const db = mongoose.connection;
db.once('open', function () {
    console.log('DB 연결됨');
});

db.on('error', function (err) {
    console.error('DB ERROR : ', err);
});


// Other settings
app.set('view engine', 'ejs');
app.use(express.static(__dirname + '/public'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true}));
app.use(methodOverride('_method'));
app.use(flash());

// session,
app.use(session({
    secret: 'dabomi',
    resave: false,
    saveUninitialized: false,
    store: MongoStore.create({
        mongoUrl: 'mongodb+srv://cdabomi60:cdabomi60@cluster0.gtjcyjz.mongodb.net/calllink_admin?retryWrites=true&w=majority',
        collectionName: 't_sessions',
    }),
    cookie: {
        maxAge: 1000 * 60 * 60
    }
}));


// Passport
app.use(passport.initialize());
app.use(passport.session());

// locals
app.use(function (req, res, next) {
    res.locals.isAuthenticated = req.isAuthenticated();
    res.locals.currentUser = req.user;
    res.locals.util = util;
    next();
});

// Routes
app.use('/', require('./routes/routeHome'));


// error
app.use(function (req, res, next) {
    res.status(400).render('error/404');
});
app.use(function (error, req, res, next) {
    console.error(error)
    res.status(500).render('error/500');
});

// Port setting
const port = 3000;
app.listen(port, '0.0.0.0', function () {
    console.info('server on! http://localhost:' + port);
});