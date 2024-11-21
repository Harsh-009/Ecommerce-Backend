const { Router } = require("express");

const router = Router();
const { getLogin, postLogin, postLogout, getSignUp, postSignUp } = require("../controllers/auth");

router.get("/login", getLogin);

router.get("/signup", getSignUp);

router.post("/login", postLogin);

router.post("/signup", postSignUp);

router.post('/logout', postLogout)

module.exports = router;