const path = require("path");
require("dotenv").config();
const express = require("express");
const bodyParser = require("body-parser");

const errorController = require("./controllers/error");
const mongoose = require("mongoose");

const app = express();

app.set("view engine", "ejs");
app.set("views", "views");

const adminRoutes = require("./routes/admin");
const shopRoutes = require("./routes/shop");

app.use(bodyParser.urlencoded({ extended: false }));
app.use(express.static(path.join(__dirname, "public")));

// app.use(async (req, res, next) => {
//   try {
//     // finding the user in the database
//     const user = await User.findById("6738385f4bf1fe0c7925bf01");

//     // attach the user obj to the req with the user constructor
//     req.user = new User(user.name, user.email, user.cart, user._id);

//     next(); // proceed to the next middleware
//   } catch (err) {
//     console.log("something went wrong while connecting with user", err);
//   }
// });

app.use("/admin", adminRoutes);
app.use(shopRoutes);

app.use(errorController.get404);

mongoose
  .connect(process.env.DATABASE_URL)
  .then(() => {
    app.listen(process.env.PORT);
    console.log('connected')
  })
  .catch((err) => console.log(err));
