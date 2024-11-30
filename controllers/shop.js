const fs = require("fs");
const path = require("path");
const Product = require("../models/product");
const Order = require("../models/order");
const product = require("../models/product");
const pdfDocument = require("pdfkit");

const getProducts = async (req, res, next) => {
  try {
    const products = await Product.find();
    return res.render("shop/product-list", {
      prods: products,
      pageTitle: "All products",
      path: "/products",
    });
  } catch (err) {
    const error = new Error(err);
    error.httpStatusCode = 500;
    return next(error);
  }
};

const getProduct = async (req, res, next) => {
  const { productId } = req.params;

  try {
    const product = await Product.findById(productId);
    return res.render("shop/product-detail", {
      product: product,
      pageTitle: product.title,
      path: "/products",
    });
  } catch (err) {
    const error = new Error(err);
    error.httpStatusCode = 500;
    return next(error);
  }
};

const getIndex = async (req, res, next) => {
  try {
    const products = await Product.find();
    return res.render("shop/index", {
      prods: products,
      pageTitle: "Shop",
      path: "/",
    });
  } catch (err) {
    const error = new Error(err);
    error.httpStatusCode = 500;
    return next(error);
  }
};

const getCart = async (req, res, next) => {
  try {
    console.log(req.user);
    const user = await req.user.populate("cart.items.productId");
    const cartItems = req.user.cart.items;
    res.render("shop/cart", {
      path: "/cart",
      pageTitle: "Your Cart",
      products: cartItems,
    });
  } catch (err) {
    const error = new Error(err);
    error.httpStatusCode = 500;
    return next(error);
  }
};

const postCart = async (req, res, next) => {
  const { productId } = req.body;

  try {
    const product = await Product.findById(productId);
    if (!product) {
      console.log("product not found");
    }
    const result = await req.user.addToCart(product);
    res.redirect("/cart");
  } catch (err) {
    const error = new Error(err);
    error.httpStatusCode = 500;
    return next(error);
  }
};

const postCartDeleteProduct = async (req, res, next) => {
  const { productId } = req.body;
  try {
    const result = await req.user.deleteItemFromCart(productId);
    res.redirect("/cart");
  } catch (err) {
    const error = new Error(err);
    error.httpStatusCode = 500;
    return next(error);
  }
};

const postOrder = async (req, res, next) => {
  try {
    const populatedUser = await req.user.populate("cart.items.productId"); //populate the cart.items with the order details
    const products = populatedUser.cart.items.map((i) => {
      return {
        quantity: i.quantity,
        product: { ...i.productId._doc }, // spread the product document into the order
      };
    });
    const order = new Order({
      user: {
        email: req.user.email,
        userId: req.user,
      },
      products: products,
    });
    await order.save();
    await req.user.clearCart();
    // then redirect to orders after placing an order
    res.redirect("/orders");
  } catch (err) {
    const error = new Error(err);
    error.httpStatusCode = 500;
    return next(error);
  }
};

const getOrders = async (req, res, next) => {
  try {
    const orders = await Order.find({ "user.userId": req.user._id });

    res.render("shop/orders", {
      path: "/orders",
      pageTitle: "Your Orders",
      orders: orders,
    });
  } catch (err) {
    const error = new Error(err);
    error.httpStatusCode = 500;
    return next(error);
  }
};

const getInvoice = async (req, res, next) => {
  const orderId = req.params.orderId;
  try {
    const order = await Order.findById(orderId);
    if (!order) {
      return next(new Error("No order found."));
    }
    if (order.user.userId.toString() !== req.user._id.toString()) {
      return next(new Error("Unauthorized order"));
    }
    const invoiceName = "invoice-" + orderId + ".pdf";
    const invoicePath = path.join("data", "invoices", invoiceName);

    const pdfDoc = new pdfDocument();
    res.setHeader("Content-Type", "application/pdf");
    res.setHeader("Content-Disposition", `attached; filename="${invoiceName}"`);
    pdfDoc.pipe(fs.createWriteStream(invoicePath));
    pdfDoc.pipe(res);

    pdfDoc.fontSize(26).text("Invoice", {
      underline: true,
    });
    pdfDoc.text("------------------------------");
    pdfDoc.fontSize(20).text(`Order Id: ${orderId}`);
    let totalPrice = 0;
    order.products.forEach((prod) => {
      totalPrice += prod.quantity * prod.product.price
      pdfDoc.text(
        `${prod.product.title} - ${prod.quantity} x $${prod.product.price}`
      );
    });
    pdfDoc.text(`Total Price: $${totalPrice}`)

    pdfDoc.end();
  } catch (err) {
    return next(err);
  }
};

module.exports = {
  getProduct,
  getProducts,
  getIndex,
  postCart,
  getOrders,
  postOrder,
  postCartDeleteProduct,
  getCart,
  getInvoice,
};
