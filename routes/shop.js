const {
  getIndex,
  getProduct,
  getProducts,
  postCart,
  getCart,
  postCartDeleteProduct,
  postOrder,
  getOrders,
} = require("../controllers/shop");
const path = require("path");
const express = require("express");


const router = express.Router();

router.get("/", getIndex);

router.get("/products", getProducts);

router.get("/products/:productId", getProduct);

// router.get('/cart', getCart);

// router.post("/cart", postCart);

// router.post('/cart-delete-item', postCartDeleteProduct);

// router.post('/create-order', postOrder);

// router.get('/orders', getOrders);

module.exports = router;
