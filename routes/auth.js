const { Router } = require("express");
const { check, body } = require("express-validator");

const router = Router();
const {
  getLogin,
  postLogin,
  postLogout,
  getSignUp,
  postSignUp,
  getReset,
  postReset,
  getNewPassword,
  postNewPassword,
} = require("../controllers/auth");

router.get("/login", getLogin);

router.post(
  "/login",
  [
    check("email")
      .isEmail()
      .withMessage("Please enter a valid email")
      .normalizeEmail(),
    body("password")
      .isAlphanumeric()
      .withMessage("Please enter a correct Password")
      .trim(),
  ],
  postLogin
);

router.get("/signup", getSignUp);

router.post(
  "/signup",
  [
    check("email")
      .isEmail()
      .withMessage("Please enter a valid email")
      .custom((value, { req }) => {
        if (value === "test@test.com") {
          throw new Error("This email address is forbidden");
        }
        return true;
      })
      .normalizeEmail(),
    body(
      "password",
      "Please enter a password of atleast 5 character or numbers"
    )
      .isLength({ min: 5 })
      .isAlphanumeric()
      .trim(),
    body("confirmPassword").trim().custom((val, { req }) => {
      if (val !== req.body.password) {
        throw new Error("Both passwords must match");
      }
      return true;
    }),
  ],
  postSignUp
);

router.post("/logout", postLogout);

router.get("/reset", getReset);

router.post("/reset", postReset);

router.get("/reset/:token", getNewPassword);

router.post("/new-password", postNewPassword);

module.exports = router;
