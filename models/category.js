const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const categorySchema = new Schema({
  title: {
    type: String,
    required: true
  },
  imageUrl: {
    type: String,
    required: true
  },
  url: {
    type: String,
    required: true
  },
  products: [
    {
      productId: {
        type: Schema.Types.ObjectId,
        ref: 'Product',
        required: true
      }
    }
  ]
  
});

module.exports = mongoose.model('Category', categorySchema);

