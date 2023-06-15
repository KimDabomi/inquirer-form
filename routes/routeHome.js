const express = require("express");
const router = express.Router();
const util = require("../common/util");
const passport = require("passport");
const modelUsers = require("../models/modelUsers");

// Home
router.get("/", function (req, res, next) {
  modelUsers
    .getAllUsers()
    .then((users) => {
      res.render("welcome", { users: users });
    })
    .catch((err) => {
      console.log(err);
      next(err);
    });
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

  // modelUsers.create({
  //     username: username,
  //     password: password,
  //     name: name,
  //     passwordConfirmation: passwordConfirmation
  // }).then(() => {
  //     passport.authenticate('local-login', {
  //         successRedirect: '/',
  //         failureRedirect: '/login'
  //     });
  //     res.status(200).redirect('/login');
  // })
  // .catch((error) => {
  //     res.status(500).send({ message: '에러가 발생했습니다: ' + error.message });
  // });
});
