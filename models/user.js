// const { ObjectId } = require("mongodb");
// const { getDb } = require("../util/database");

// class User {
//   constructor(username, email, cart, id) {
//     this.name = username;
//     this.email = email;
//     this.cart = cart; // {items: []}
//     this._id = id;
//   }

//   save() {
//     const db = getDb();
//     return db.collection("users").insertOne(this);
//   }

//   addToCart(product) {
//     const cartProductIndex = this.cart.items.findIndex((cp) => {
//       return cp.productId.toString() === product._id.toString();
//     });
//     const updatedCartItems = [...this.cart.items];
//     let newQuantity = 1;
//     if (cartProductIndex >= 0) {
//       newQuantity = this.cart.items[cartProductIndex].quantity + 1;
//       updatedCartItems[cartProductIndex].quantity = newQuantity;
//     } else {
//       updatedCartItems.push({
//         productId: new ObjectId(product._id),
//         quantity: newQuantity,
//       });
//     }
//     const updatedCart = {
//       items: updatedCartItems,
//     };
//     const db = getDb();
//     return db
//       .collection("users")
//       .updateOne(
//         { _id: new ObjectId(this._id) },
//         { $set: { cart: updatedCart } }
//       );
//   }

//   async getCart() {
//     const db = getDb();
//     const productIds = this.cart.items.map((i) => {
//       // return product id's as an array
//       return i.productId;
//     });

//     try {
//       const products = await db // this loop through the collection and find all the items that are listed in productIds array and at last convert it into array
//         .collection("products")
//         .find({
//           _id: { $in: productIds },
//         })
//         .toArray();
//       // checking if its a valid item or not deleting by admin
//       const validCartItem = this.cart.items.filter((cartItem) => {
//         return products.some(
//           (prod) => prod._id.toString() === cartItem.productId.toString()
//         );
//       });
//       if (validCartItem.length !== this.cart.items.length) {
//         this.cart.items = validCartItem;
//         await db
//           .collection("users")
//           .updateOne(
//             { _id: new ObjectId(this._id) },
//             { $set: { cart: { items: validCartItem } } }
//           );
//       }

//       return products.map((p) => {
//         const cartItem = this.cart.items.find((i) => {
//           return i.productId.toString() === p._id.toString();
//         }); // responsible for finding cart item qunatity

//         return {
//           ...p,
//           quantity: cartItem?.quantity || 0,
//         };
//       });
//     } catch (err) {
//       console.log("Error fetching cart items", err);
//       throw err;
//     }
//   }

//   deleteItemFromCart(productId) {
//     const updatedCartItems = this.cart.items.filter((item) => {
//       return item.productId.toString() !== productId.toString();
//     });
//     const db = getDb();
//     db.collection("users").updateOne(
//       { _id: new ObjectId(this._id) },
//       { $set: { cart: { items: updatedCartItems } } }
//     );
//   }

//   async addOrder() {
//     const db = getDb();
//     try {
//       const products = await this.getCart();
//       const order = {
//         items: products,
//         user: {
//           // insserting user data into order
//           _id: new ObjectId(this._id),
//           name: this.name,
//         },
//       };
//       const orderResult = await db.collection("orders").insertOne(order);
//       // clearing the cart
//       this.cart = { items: [] };
//       // also clearing cart from db
//       const updatedResult = await db.collection("users").updateOne(
//         { _id: new ObjectId(this._id) }, // match the user whose cart we wanna update
//         { $set: { cart: { items: [] } } } // set the cart field empty
//       );
//       return { orderResult, updatedResult };
//     } catch (err) {
//       console.log("Cant add orders now, something went wrong", err);
//       throw err;
//     }
//   }

//   async getOrders() {
//     const db = getDb();
//     try {
//       const orders = await db
//         .collection("orders")
//         .find({ "user._id": new ObjectId(this._id) })
//         .toArray();

//       // console.log(orders);
//       return orders;
//     } catch (err) {
//       console.log("cant get user orders", err);
//     }
//   }

//   static findById(userId) {
//     const db = getDb();
//     return db
//       .collection("users")
//       .findOne({ _id: new ObjectId(userId) })
//       .then((user) => {
//         return user;
//       })
//       .catch((err) => console.log(err));
//   }
// }

// module.exports = User;
