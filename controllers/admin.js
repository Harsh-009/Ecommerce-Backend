const Product = require("../models/product");
const { validationResult } = require("express-validator");

const getAddProduct = async (req, res, next) => {
  if (!req.session.isLoggedIn) {
    return res.redirect("/login");
  }
  try {
    return res.render("admin/edit-product", {
      pageTitle: "Add Product",
      path: "/admin/add-product",
      editing: false,
      hasError: false,
      errorMessage: null,
      validationErrors: []
    });
  } catch (err) {
    console.log(err);
  }
};

const postAddProduct = async (req, res, next) => {
  const { title, price, description, imageUrl } = req.body;
  
  const errors = validationResult(req)

  if(!errors.isEmpty()) {
    return res.status(422).render("admin/edit-product", {
      pageTitle: "Add Product",
      path: "/admin/add-product",
      editing: false,
      hasError: true,
      product: {
        title: title,
        price: price,
        description: description,
        imageUrl: imageUrl,
      },
      errorMessage: errors.array()[0].msg,
      validationErrors: errors.array()
    });
  }

  const product = new Product({
    title: title,
    price: price,
    description: description,
    imageUrl: imageUrl,
    userId: req.user,
  });
  try {
    const result = await product.save();
    res.redirect("/admin/products");
  } catch (err) {
    console.log("Error creating the product ", err);
    const error = new Error(err);
    error.httpStatusCode = 500;
    return next(error)
  }
};

const getEditProduct = async (req, res, next) => {
  const editMode = req.query.edit;
  if (!editMode) {
    return res.redirect("/");
  }
  const { productId } = req.params;

  try {
    const editDetails = await Product.findById(productId);

    if (!editDetails) {
      return res.redirect("/");
    }

    return res.render("admin/edit-product", {
      pageTitle: "Edit Product",
      path: "/admin/edit-product",
      editing: editMode,
      product: editDetails,
      hasError: false,
      errorMessage: null,
      validationErrors: []
    });
  } catch (err) {
    console.log("Error finding Edit Details", err);
  }
};

const postEditProduct = async (req, res, next) => {
  const { title, price, description, imageUrl, productId } = req.body;
  const errors = validationResult(req)

  if(!errors.isEmpty()) {
    return res.status(422).render("admin/edit-product", {
      pageTitle: "Add Product",
      path: "/admin/add-product",
      editing: false,
      hasError: true,
      product: {
        title: title,
        price: price,
        description: description,
        imageUrl: imageUrl,
        _id: productId
      },
      errorMessage: errors.array()[0].msg,
      validationErrors: errors.array()
    });
  }

  try {
    const product = await Product.findById(productId);
    if (product.userId.toString() !== req.user._id.toString()) {
      return res.redirect("/");
    }
    if (!product) {
      console.log("product not found");
      return res.status(404).send("Product not Found");
    }
    product.title = title;
    product.description = description;
    product.price = price;
    product.imageUrl = imageUrl;

    await product.save();
    return res.redirect("/admin/products");
  } catch (err) {
    console.log("Updating product failed", err);
    res.status(500).send("Failed to update product");
  }
};

const getProducts = async (req, res, next) => {
  try {
    const products = await Product.find({ userId: req.user._id });
    // .select("title price -_id")
    // .populate("userId", "name");
    return res.render("admin/products", {
      prods: products,
      pageTitle: "Admin Products",
      path: "/admin/products",
    });
  } catch (err) {
    console.log("Error Finding products ", err);
  }
};

const postDeleteProduct = async (req, res, next) => {
  const { productId } = req.body;

  try {
    await Product.deleteOne({ _id: productId, userId: req.user._id }); // Await the deleteById function
    res.redirect("/admin/products");
  } catch (err) {
    console.log(err);
  }
};

module.exports = {
  postDeleteProduct,
  getAddProduct,
  postAddProduct,
  getEditProduct,
  postEditProduct,
  getProducts,
};
