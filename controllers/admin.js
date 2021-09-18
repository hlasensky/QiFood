const Product = require('../models/product');

exports.getAddProduct = (req, res, next) => {
    res.render("admin/edit-product", {
        pageTitle: 'Add Product',
        path: '/admin/add-product',
        editing: false
    })
}