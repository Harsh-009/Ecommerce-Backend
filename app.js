const path = require("path");
const dotenv = require("dotenv");
dotenv.config();
const express = require("express");
const bodyParser = require("body-parser");
const csrf = require('csurf')
const errorController = require("./controllers/error");
const mongoose = require("mongoose");
const session = require("express-session");
const MongoDBStore = require("connect-mongodb-session")(session);
const app = express();
const User = require("./models/user");
const csrfProtection = csrf();
const flash = require('connect-flash')

// session store
const store = new MongoDBStore({
  uri: process.env.DATABASE_URL,
  collection: "sessions",
});

// views
app.set("view engine", "ejs");
app.set("views", "views");

// routes
const adminRoutes = require("./routes/admin");
const shopRoutes = require("./routes/shop");
const authRoutes = require("./routes/auth");

app.use(bodyParser.urlencoded({ extended: false }));
app.use(express.static(path.join(__dirname, "public")));
app.use(
  // adding session middleware to app
  session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    store: store,
  })
);
app.use(csrfProtection)
app.use(flash())

app.use(async (req, res, next) => {
  if(!req.session.user) {
    return next()
  }
  try {
    const user = await User.findById(req.session.user._id);
    req.user = user;
    next();
  } catch (err) {
    console.log("something went wrong while connecting with user", err);
  }
});

app.use((req, res, next) => {
  res.locals.isAuthenticated = req.session.isLoggedIn;
  res.locals.csrfToken = req.csrfToken()
  next()
})

app.use("/admin", adminRoutes);
app.use(shopRoutes);
app.use(authRoutes);
app.use(errorController.get404);

mongoose
  .connect(process.env.DATABASE_URL)
  .then(() => {
    app.listen(process.env.PORT);
  })
  .catch((err) => console.log(err));
