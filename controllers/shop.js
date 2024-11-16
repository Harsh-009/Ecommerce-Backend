const Product = require("../models/product");
const Order = require("../models/order");
const product = require("../models/product");

const getProducts = async (req, res, next) => {
  try {
    const products = await Product.find();
    return res.render("shop/product-list", {
      prods: products,
      pageTitle: "All products",
      path: "/products",
    });
  } catch (err) {
    console.log("Error fetching all products", err);
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
    console.log("Error finding product detail", err);
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
    console.log("Error finding products", err);
  }
};

const getCart = async (req, res, next) => {
  try {
    const populate = await req.user.populate("cart.items.productId");
    const cartItems = req.user.cart.items;
    res.render("shop/cart", {
      path: "/cart",
      pageTitle: "Your Cart",
      products: cartItems,
    });
  } catch (err) {
    console.log("Error fetching cart :", err);
    next(err);
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
    console.log(err);
  }
};

const postCartDeleteProduct = async (req, res, next) => {
  const { productId } = req.body;
  try {
    const result = await req.user.deleteItemFromCart(productId);
    res.redirect("/cart");
  } catch (err) {
    console.log("unable to delete the item", err);
  }
};

const postOrder = async (req, res, next) => {
  try {
    const populatedUser = await req.user.populate("cart.items.productId"); //populate the cart.items with the order details
    const products = populatedUser.cart.items.map((i) => {
      return {
        quantity: i.quantity,
        product: {...i.productId._doc}, // spread the product document into the order
      };
    });
    console.log(products);
    const order = new Order({
      user: {
        name: req.user.name,
        userId: req.user,
      },
      products: products,
    });
    await order.save()
    await req.user.clearCart()
    // then redirect to orders after placing an order
    res.redirect("/orders");
  } catch (err) {
    console.log("Error placing order : ", err);
    next(err);
  }
};

const getOrders = async (req, res, next) => {
  try {
    const orders = await Order.find({"user.userId": req.user._id})
    console.log(orders)

    res.render("shop/orders", {
      path: "/orders",
      pageTitle: "Your Orders",
      orders: orders,
    });
  } catch (err) {
    console.log("error in getOrders controller", err);
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
};
