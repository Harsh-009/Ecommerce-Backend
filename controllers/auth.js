const User = require("../models/user");
const crypto = require("crypto");
const bcrypt = require("bcryptjs");
const nodemailer = require("nodemailer");
require("dotenv").config();

// initializing nodemailer tranportation
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.NODE_EMAIL,
    pass: process.env.NODE_PASS,
  },
});

// returning the login route view
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

// returning the signup route view
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

// handling user login auth by finding email also validating password, and making a session for user
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

// signing up the user through user details and sending the mail confimation
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

    await transporter.sendMail(mailOptions);
    return res.status(200).redirect("/login");
  } catch (err) {
    console.log(err);
    return res.status(500).redirect("/signup");
  }
};

// Logout handler-> destroy the session whenever user hits logout
const postLogout = (req, res) => {
  req.session.destroy((err) => {
    console.log(err);
    res.redirect("/");
  });
};

// returning the reset route view
const getReset = (req, res, next) => {
  let message = req.flash("error");
  if (message.length > 0) {
    message = message[0];
  } else {
    message = null;
  }
  res.render("auth/reset", {
    path: "/reset",
    pageTitle: "Reset",
    errorMessage: message || null,
  });
};

// resetting password =>
const postReset = async (req, res, next) => {
  const { email } = req.body;

  try {
    const buffer = await new Promise((resolve, reject) => {
      crypto.randomBytes(32, (err, buffer) => {
        if (err) return reject(err);
        resolve(buffer);
      });
    });

    const token = buffer.toString("hex"); // changing it to hex val

    const user = await User.findOne({ email });

    if (!user) {
      req.flash("error", "No user exists with that email");
      return res.redirect("/reset");
    }

    user.resetToken = token;
    user.resetTokenExpiration = Date.now() + 3600000;
    await user.save(); // awaiting user to be saved

    //send the reset email
    const mailOptions = {
      to: email,
      from: "harsh@dev.com",
      subject: "Password reset",
      html: `
        <p>You requested a password reset</p>
        <p>Click this <a href="http://localhost:8080/reset/${token}">link</a> to set a new password </p>
      `,
    };

    res.redirect("/");
    await transporter.sendMail(mailOptions);
  } catch (err) {
    console.log("Error in post reset", err);
    res.redirect("/reset");
  }
};

// returning the new password view to user on click of mail link
const getNewPassword = async (req, res, next) => {
  const { token } = req.params;
  try {
    const user = await User.findOne({
      resetToken: token,
      resetTokenExpiration: { $gt: Date.now() },
    });

    if (!user) {
      req.flash("error", "No user found with that request");
      return res.redirect("/reset");
    }

    let message = req.flash("error");
    if (message.length > 0) {
      message = message[0];
    } else {
      message = null;
    }
    res.render("auth/new-password", {
      path: "/new-password",
      pageTitle: "New Password",
      errorMessage: message || null,
      userId: user._id.toString(),
      passwordToken: token,
    });
  } catch (err) {
    console.log(err);
  }
};

// checking and validating userPassword
const postNewPassword = async (req, res, next) => {
  const { password: newPassword, userId, passwordToken } = req.body;

  try {
    const user = await User.findOne({
      resetToken: passwordToken,
      resetTokenExpiration: { $gt: Date.now() },
      _id: userId,
    });

    if (!user) {
      req.flash("error", "Invalid or expired token.");
      return res.redirect("/reset");
    }

    const hashedNewPassword = await bcrypt.hash(newPassword, 12);

    user.password = hashedNewPassword;
    user.resetToken = undefined;
    user.resetTokenExpiration = undefined;

    await user.save();
    return res.redirect("/login");
  } catch (err) {
    console.log(err);
    req.flash("error", "An error occurred while resetting your password. Please try again.");
    res.redirect("/reset");
  }
};

module.exports = {
  getLogin,
  postLogin,
  postLogout,
  getSignUp,
  postSignUp,
  getReset,
  postReset,
  getNewPassword,
  postNewPassword,
};
