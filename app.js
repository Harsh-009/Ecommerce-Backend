const path = require("path");
const dotenv = require("dotenv");
dotenv.config();
const express = require("express");
const bodyParser = require("body-parser");
const csrf = require("csurf");
const multer = require('multer')
const errorController = require("./controllers/error");
const mongoose = require("mongoose");
const session = require("express-session");
const MongoDBStore = require("connect-mongodb-session")(session);
const app = express();
const User = require("./models/user");
const csrfProtection = csrf();
const flash = require("connect-flash");

// session store
const store = new MongoDBStore({
  uri: process.env.DATABASE_URL,
  collection: "sessions",
});

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
// views
app.set("view engine", "ejs");
app.set("views", "views");

// routes
const adminRoutes = require("./routes/admin");
const shopRoutes = require("./routes/shop");
const authRoutes = require("./routes/auth");

const fileStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/images');
  },
  filename: (req, file, cb) => {
    cb(null, new Date().toISOString().replace(/:/g, '-') + '-' + file.originalname)
  }
})
const fileFilter = (req, file, cb) => {
  if(file.mimetype === 'image/png' || file.mimetype === 'image/jpeg' || file.mimetype === 'image/jpg') {
    cb(null, true);
  }
  else {
    cb(null, false);
  }
}

app.use(
  multer({storage: fileStorage, fileFilter: fileFilter}).single('image')
)

app.use(express.static(path.join(__dirname, "public")));
app.use('/uploads/images',express.static(path.join(__dirname, 'uploads/images')))
app.use(
  // adding session middleware to app
  session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    store: store,
  })
);
app.use(csrfProtection);
app.use(flash());

app.use((req, res, next) => {
  res.locals.isAuthenticated = req.session.isLoggedIn;
  res.locals.csrfToken = req.csrfToken();
  next();
});

app.use(async (req, res, next) => {
  if (!req.session.user) {
    return next();
  }
  try {
    const user = await User.findById(req.session.user._id);
    if (!user) {
      return next();
    }
    req.user = user;
    next();
  } catch (err) {
    console.log("something went wrong while connecting with user", err);
    next(new Error(err))
  }
});


app.use("/admin", adminRoutes);
app.use(shopRoutes);
app.use(authRoutes);
app.get('/500',errorController.get500);
app.use(errorController.get404);

// error middleware
app.use((error, req, res, next) => {
  console.log(error.message)
  console.log(req.session, 'printing session in error middleware')
  res.status(500).render('500', {
    pageTitle: 'Server Error!',
    path: '/500',
    isAuthenticated: !!req.session?.isLoggedIn
  })
})

mongoose
  .connect(process.env.DATABASE_URL)
  .then(() => {
    app.listen(process.env.PORT);
  })
  .catch((err) => console.log(err));
