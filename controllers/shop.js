const Product = require('../models/product');
const Category = require('../models/category');
const Order = require('../models/order');

exports.getIndex = (req, res, next) => {
  /* rendering landing page with fetched data from category collection */
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
  /* rendering menu page with fetched data from category collection and populating array of products*/
  Category
    .find()
    .populate({
      path: "products.productsArray.productId"
    })
    .exec(function (err, categoryes) {
      res.render('shop/menu', {
        pageTitle: 'Menu',
        path: '/menu',
        categoryes: categoryes
      });
  });

  /*  .then(categoryes => {
      res.render('shop/menu', {
        pageTitle: 'Menu',
        path: '/menu',
        categoryes: categoryes
      });
    });*/
}

exports.getKontakt = (req, res, next) => {
    /* rendering contact page*/
    res.render('shop/kontakt', {
      pageTitle: 'Kontakt',
      path: '/kontakt',
      
    });
}

