const Product = require('../models/product');
const Category = require('../models/category');
const Order = require('../models/order');

exports.getIndex = (req, res, next) => {
  Category.find()
    .then(categoryes => {
      res.render('shop/index', {
        categoryes: categoryes,
        pageTitle: 'QiFood',
        path: '/',
        
      });
    })
    .catch(err => {
      console.log(err);
    });
}

exports.getMenu = (req, res, next) => {
    res.render('shop/menu', {
      pageTitle: 'Menu',
      path: '/menu',
      categoryes: categoryes,
      products: products
    });
}

exports.getKontakt = (req, res, next) => {
    res.render('shop/kontakt', {
      pageTitle: 'Kontakt',
      path: '/kontakt',
      
    });
}

