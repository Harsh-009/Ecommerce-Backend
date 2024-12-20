const { Schema, model } = require("mongoose");

const productSchema = new Schema({
  title: {
    type: String,
    required: true,
  },
  price: {
    type: Number,
    required: true,
  },
  description: {
    type: String,
    required: true,
  },
  imageUrl: {
    type: String,
    required: true,
  },
  userId: {
    type: Schema.Types.ObjectId,
    ref: 'User'
  }
});

module.exports = model("Product", productSchema);

// const { getDb } = require("../util/database");
// const { ObjectId } = require("mongodb");

// class Product {
//   constructor(title, price, description, imageUrl, id, userId) {
//     this.title = title;
//     this.price = price;
//     this.description = description;
//     this.imageUrl = imageUrl;
//     this._id = id ? new ObjectId(id) : null;
//     this.userId = userId
//   }

//   save() {
//     const db = getDb(); // connection
//     let dbOp;
//     if (this._id) {
//       //update the product
//       dbOp = db
//         .collection("products")
//         .updateOne({ _id: this._id }, { $set: this });
//     } else {
//       dbOp = db.collection("products").insertOne(this);
//     }
//     return dbOp
//       .then((result) => console.log(result))
//       .catch((err) => console.log(err));
//   }

//   static fetchAll() {
//     const db = getDb();
//     return db
//       .collection("products")
//       .find()
//       .toArray()
//       .then((products) => {
//         return products;
//       })
//       .catch((err) => {
//         console.log(err);
//       });
//   }

//   static async findById(prodId) {
//     try {
//       const db = getDb();
//       const product = await db
//         .collection("products")
//         .findOne({ _id: new ObjectId(prodId) });
//       return product;
//     } catch (err) {
//       console.log(err);
//     }
//   }

//   static async deleteById(prodId) {
//     try {
//       const db = getDb()
//       const product = await db.collection('products').deleteOne({_id: new ObjectId(prodId)})
//       console.log('deleted')
//     } catch (err) {
//       console.log(err)
//     }
//   }
// }

// module.exports = Product;
