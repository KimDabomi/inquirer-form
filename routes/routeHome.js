const express = require("express");
const router = express.Router();
const passport = require("passport");
const modelInquirer = require("../models/modelInquirer");
const RobotxtMaria = require('../config/database/robotxtDB');
const HotpayMaria = require('../config/database/hotpayDB');
const phpunserialize = require('php-unserialize');



// Home
router.get("/", async function (req, res, next) {
  try {
    // mongodb db users 리스트 가져오기
    const aUsers = (await modelInquirer.find()).map(oUser => {
      return {
        'name': oUser.username,
        'phone': oUser.phone
      }
    });

    //robotxt db wp_wpforms_db 리스트 가져오기
    const aRobotxtWpforms = await RobotxtMaria.query("SELECT form_value FROM wp_wpforms_db");
    const aHotpayWpforms = await HotpayMaria.query("SELECT form_value FROM wp_wpforms_db");


    const aRobotxtInquirer = aRobotxtWpforms.map(item => {
      return {
        'type': 'robotxt',
        'name': phpunserialize.unserialize(item.form_value)['이름'],
        'phone': phpunserialize.unserialize(item.form_value)['휴대폰번호'],
        'url': phpunserialize.unserialize(item.form_value)['웹사이트 URL']
      }
    }).filter(Boolean);

    const aHotpayInquirer = aHotpayWpforms.map(item => {
      return {
        'type': 'hotpay',
        'name': phpunserialize.unserialize(item.form_value)['이름'],
        'phone': phpunserialize.unserialize(item.form_value)['연락처'],
        'url': phpunserialize.unserialize(item.form_value)['브랜드명']
      }
    }).filter(Boolean);

    const aInquirer = [...aRobotxtInquirer, ...aHotpayInquirer];


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

