const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  price: {
    type: Number,
    required: true,
    min: 0
  },
  unit: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    required: true
  },
  image: {
    type: String,
    required: true
  },
  shelfLife: {
    type: String,
    required: true
  },
  nutritionalInfo: {
    calories: Number,
    protein: Number,
    fat: Number,
    calcium: Number
  },
  benefits: [String]
}, {
  timestamps: true
});

module.exports = mongoose.model('Product', productSchema); 