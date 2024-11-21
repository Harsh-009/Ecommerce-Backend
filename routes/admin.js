const path = require("path");

const express = require("express");
const { isAuth } = require("../middlewares/isAuth");
const {
  getAddProduct,
  getEditProduct,
  getProducts,
  postAddProduct,
  postDeleteProduct,
  postEditProduct,
} = require("../controllers/admin");

const router = express.Router();

// /admin/add-product => GET
router.get("/add-product", isAuth, getAddProduct);

// // /admin/products => GET
router.get("/products", isAuth, getProducts);

// // /admin/add-product => POST
router.post("/add-product", isAuth, postAddProduct);

router.get("/edit-product/:productId", isAuth, getEditProduct);

router.post("/edit-product", isAuth, postEditProduct);

router.post("/delete-product", isAuth, postDeleteProduct);

module.exports = router;
