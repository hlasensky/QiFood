const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const userSchema = new Schema({
  email: {
    type: String,
    required: true
  },
  password: {
    type: String,
    required: true
  },
  isAdmin: {
    type: Boolean,
    required: true
  },
  cart: {
    items: [
      {
        productId: {
          type: Schema.Types.ObjectId,
          ref: 'Product',
          required: true
        },
        quantity: { type: Number, required: true }
      }
    ]
  },
  expireDate: {  },
  
  resetToken: String,
  resetTokenExpiration: Date,
});


userSchema.methods.addToCart = function (product, productQuantity) {
  console.log(product._id, productQuantity)
}

module.exports = mongoose.model('User', userSchema);

