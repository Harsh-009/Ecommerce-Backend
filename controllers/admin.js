const { ObjectId } = require("mongodb");
const Product = require("../models/product");

const getAddProduct = async (req, res, next) => {
  try {
    return res.render("admin/edit-product", {
      pageTitle: "Add Product",
      path: "/admin/add-product",
      editing: false,
    });
  } catch (err) {
    console.log(err);
  }
};

const postAddProduct = async (req, res, next) => {
  const { title, price, description, imageUrl } = req.body;
  const product = new Product({
    title: title,
    price: price,
    description: description,
    imageUrl: imageUrl,
  });
  try {
    const result = await product.save();
    res.redirect("/admin/products");
  } catch (err) {
    console.log("Error creating the product ", err);
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
    });
  } catch (err) {
    console.log("Error finding Edit Details", err);
  }
};

const postEditProduct = async (req, res, next) => {
  const { title, price, description, imageUrl, productId } = req.body;

  try {
    const product = await Product.findById(productId);
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
    const products = await Product.find();

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
    await Product.deleteById(productId); // Await the deleteById function
    console.log("Product deleted");
    res.redirect("/admin/products");
  } catch (err) {
    console.log(err);
    next(err); // Pass the error to the next middleware if any
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
