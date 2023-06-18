const express = require("express");
const router = express.Router();
const util = require("../common/util");
const passport = require("passport");
const modelUsers = require("../models/modelUsers");
const UpdateUser = require('../models/modelUpdate');
const RobotxtMaria = require('../config/database/robotxtDB');
const KsamhMaria = require('../config/database/ksamhDB');
const phpunserialize = require('php-unserialize');
const schedule = require('node-schedule');


// Home
router.get("/", async function (req, res, next) {
  try {
    // mongodb db users 리스트 가져오기
    const aUsers = (await modelUsers.find()).map( oUser => oUser.username);

    //robotxt db wp_wpforms_db 리스트 가져오기
    const aRobotxtWpforms = await RobotxtMaria.query("SELECT form_value FROM wp_wpforms_db");
    const aKsamhWpforms = await KsamhMaria.query("SELECT form_value FROM wp_wpforms_db");


    const aRobotxtInquirer = aRobotxtWpforms.map( item => {
      return {
        'type': 'robotxt',
        'name': phpunserialize.unserialize(item.form_value)['이름'],
        'phone': phpunserialize.unserialize(item.form_value)['휴대폰번호'],
        'url': phpunserialize.unserialize(item.form_value)['웹사이트 URL']
      }
    }).filter(Boolean);
    const aKsamhInquirer = aKsamhWpforms.map( item => {
      return {
        'type': 'ksamh',
        'name': phpunserialize.unserialize(item.form_value)['이름'],
        'phone': phpunserialize.unserialize(item.form_value)['연락처'],
        'url': phpunserialize.unserialize(item.form_value)['투자 예산 범위']
      }
    }).filter(Boolean);
    const aInquirer = [...aRobotxtInquirer, ...aKsamhInquirer];


    // console.log('aInquirer', aInquirer);

    res.render('welcome', { aInquirer, aUsers });
  } catch (error) {
    next(error);
  }
});


// login
router.get("/login", async function (req, res) {
  if (req.session.passport) {
    res.redirect("/");
  }

  const errors = req.flash("errors")[0] || {};
  const info = req.flash("info")[0] || {};
  console.log("login get info", info);

  res.render("login", {
    info: info,
    errors: errors,
  });
});

// Post Login
router.post(
  "/login",
  function (req, res, next) {
    const errors = {};
    const info = { username: req.body.username, password: req.body.password };
    let isValid = true;
    console.log("login post", req.body);
    if (!req.body.username) {
      isValid = false;
      errors.username = "Username is required!";
    }
    if (!req.body.password) {
      isValid = false;
      errors.password = "Password is required!";
    }

    if (isValid) {
      next();
    } else {
      req.flash("errors", errors);
      req.flash("info", info);
      console.log("post info", info);
      console.log(errors);
      res.redirect("/login");
    }
  },
  passport.authenticate("local-login", {
    successRedirect: "/",
    failureRedirect: "/login",
  })
);

// Logout
router.get("/logout", function (req, res) {
  req.logout((a) => res.redirect("/login"));
});

module.exports = router;

// Creat account
router.get("/register", function (req, res) {
  res.render("register", {
    test: { abc: "mart" },
  });
});

router.post("/register", async function (req, res) {
  const { username, password, name, passwordConfirmation } = req.body;
  try {
    const oResult = await modelUsers.create({
      username: username,
      password: password,
      name: name,
      passwordConfirmation: passwordConfirmation,
    });
    console.log("oResult", oResult);
    if (oResult) {
      res.json({
        register: true,
      });
    }
  } catch (error) {
    res.json({
      register: false,
      message: "에러가 발생했습니다: " + error.message,
    });
  }
});


// schedule
const hourSchedule = schedule.scheduleJob('0 * * * *', async function() {
  try {
    const aRobotxtWpforms = await RobotxtMaria.query("SELECT form_value FROM wp_wpforms_db");
    const aKsamhWpforms = await KsamhMaria.query("SELECT form_value FROM wp_wpforms_db");
    
    const aRobotxtInquirer = aRobotxtWpforms.map( item => {
      return {
        'type': 'robotxt',
        'username': phpunserialize.unserialize(item.form_value)['이름'],
        'phone': phpunserialize.unserialize(item.form_value)['휴대폰번호'],
        'url': phpunserialize.unserialize(item.form_value)['웹사이트 URL']
      }
    }).filter(Boolean);
    const aKsamhInquirer = aKsamhWpforms.map( item => {
      return {
        'type': 'ksamh',
        'username': phpunserialize.unserialize(item.form_value)['이름'],
        'phone': phpunserialize.unserialize(item.form_value)['연락처'],
        'url': phpunserialize.unserialize(item.form_value)['투자 예산 범위']
      }
    }).filter(Boolean);
    const aInquirer = [...aRobotxtInquirer, ...aKsamhInquirer];

    if (JSON.stringify(aInquirer) !== JSON.stringify(UpdateUser)) {
      for (const item of aInquirer) {
        const newUpdateData = new UpdateUser(item);
        await newUpdateData.save();
      }
    }

  } catch (error) {
    console.error('에러 발생: ', error);
  }
});