const { Router } = require("express");

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

router.get("/signup", getSignUp);

router.post("/login", postLogin);

router.post("/signup", postSignUp);

router.post("/logout", postLogout);

router.get("/reset", getReset);

router.post("/reset", postReset);

router.get("/reset/:token", getNewPassword);

router.post("/new-password", postNewPassword);

module.exports = router;
