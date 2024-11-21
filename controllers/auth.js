const User = require("../models/user");

const getLogin =  (req, res, next) => {
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
  })
}

const postLogin = async (req, res, next) => {
  try {
    // finding the user in the database
    const user = await User.findById("6738896df54e61046ef89b4f");

    // attach the user obj to the req with the user constructor
    req.session.isLoggedIn = true;
    req.session.user = user;
    req.session.save(err => { // redirect will be done only after succesfully creating a session
      console.log(err)
      res.redirect('/')
    })
  } catch (err) {
    console.log("something went wrong while connecting with user", err);
  }
};

const postSignUp = (req, res, next) => {

}

const postLogout = (req, res) => {
  req.session.destroy((err) => {
    console.log(err)
    res.redirect('/')
  })
}

module.exports = {
  getLogin,
  postLogin,
  postLogout,
  getSignUp,
  postSignUp
};
