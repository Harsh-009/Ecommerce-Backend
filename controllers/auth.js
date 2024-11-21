const User = require("../models/user");
const bcrypt = require("bcryptjs");

const getLogin = (req, res, next) => {
  res.render("auth/login", {
    path: "/login",
    pageTitle: "Login",
    isAuthenticated: false,
  });
};

const getSignUp = (req, res, next) => {
  res.render("auth/signup", {
    path: "/signup",
    pageTitle: "Signup",
    isAuthenticated: false,
  });
};

const postLogin = async (req, res, next) => {
  const { email, password } = req.body;

  try {
    const validUser = await User.findOne({ email: email });
    if (!validUser) {
      return res.status(404).redirect("/login");
    }
    const isMatch = await bcrypt.compare(password, validUser.password);

    if (!isMatch) {
      console.log("password does not match");
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
      console.log("user already exists");
      return res.redirect("/signup");
    }
    // if(password !== confirmPassword) {
    //   return res.status(400).send("passwords do not match").redirect('/signup')
    // }
    const hashedPassword = await bcrypt.hash(password, 12);
    const user = new User({
      email: email,
      password: hashedPassword,
      cart: {
        items: [],
      },
    });
    const result = await user.save();
    return res.status(200).redirect("/login");
  } catch (err) {
    console.log(err);
    return res
      .status(500)
      .send("An error occurred while processing your request.");
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
