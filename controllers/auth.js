const User = require("../models/user");
const bcrypt = require("bcryptjs");
const nodemailer = require("nodemailer");
require("dotenv").config();

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.NODE_EMAIL,
    pass: process.env.NODE_PASS,
  },
});


const getLogin = (req, res, next) => {
  let message = req.flash("error");
  if (message.length > 0) {
    message = message[0];
  } else {
    message = null;
  }
  res.render("auth/login", {
    path: "/login",
    pageTitle: "Login",
    errorMessage: message || null,
  });
};

const getSignUp = (req, res, next) => {
  let message = req.flash("error");
  if (message.length > 0) {
    message = message[0];
  } else {
    message = null;
  }
  res.render("auth/signup", {
    path: "/signup",
    pageTitle: "Signup",
    errorMessage: message || null,
  });
};

const postLogin = async (req, res, next) => {
  const { email, password } = req.body;

  try {
    const validUser = await User.findOne({ email: email });
    if (!validUser) {
      req.flash("error", "Invalid credentials");
      return res.status(404).redirect("/login");
    }
    const isMatch = await bcrypt.compare(password, validUser.password);

    if (!isMatch) {
      console.log("password does not match");
      req.flash("error", "Invalid password");
      return res.status(401).redirect("/login");
    }
    // attach the user obj to the req with the user constructor
    req.session.isLoggedIn = true;
    req.session.user = validUser;
    return req.session.save((err) => {
      // redirect will be done only after succesfully creating a session
      console.log(err);
      return res.redirect("/");
    });
  } catch (err) {
    console.log("something went wrong while connecting with user", err);
  }
};

const postSignUp = async (req, res, next) => {
  const { email, password, confirmPassword } = req.body;
  try {
    const userDoc = await User.findOne({ email: email });
    if (userDoc) {
      req.flash("error", "E-mail exists already, please use another email");
      return res.redirect("/signup");
    }
    if (password !== confirmPassword) {
      return res.status(400).redirect("/signup");
    }
    const hashedPassword = await bcrypt.hash(password, 12);
    const user = new User({
      email: email,
      password: hashedPassword,
      cart: {
        items: [],
      },
    });
    const result = await user.save();

    const mailOptions = {
      to: email,
      from: "harsh@dev.com",
      subject: "Signup Succeeded",
      html: "<h1>You successfully signed up</h1>",
      text: "Thank you for signing up to our shop",
    };

    await transporter.sendMail(mailOptions)
    return res.status(200).redirect("/login");
  } catch (err) {
    console.log(err);
    return res.status(500).redirect("/signup");
  }
};

const postLogout = (req, res) => {
  req.session.destroy((err) => {
    console.log(err);
    res.redirect("/");
  });
};

module.exports = {
  getLogin,
  postLogin,
  postLogout,
  getSignUp,
  postSignUp,
};
