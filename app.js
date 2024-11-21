const path = require("path");
const dotenv = require("dotenv");
dotenv.config();
const express = require("express");
const bodyParser = require("body-parser");

const errorController = require("./controllers/error");
const mongoose = require("mongoose");
const session = require("express-session");
const MongoDBStore = require("connect-mongodb-session")(session);

const app = express();
const User = require("./models/user");
const store = new MongoDBStore({
  uri: process.env.DATABASE_URL,
  collection: "sessions",
});

app.set("view engine", "ejs");
app.set("views", "views");

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

app.use(async (req, res, next) => {
  if(!req.session.user) {
    return next()
  }
  try {
    // finding the user in the database
    const user = await User.findById(req.session.user._id);
    console.log(user, 'user')
    // attach the user obj to the req with the user constructor
    req.user = user;
    next();
  } catch (err) {
    console.log("something went wrong while connecting with user", err);
  }
});

app.use("/admin", adminRoutes);
app.use(shopRoutes);
app.use(authRoutes);
app.use(errorController.get404);

mongoose
  .connect(process.env.DATABASE_URL)
  .then((result) => {
    app.listen(process.env.PORT);
  })
  .catch((err) => console.log(err));
