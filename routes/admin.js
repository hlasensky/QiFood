const path = require('path');

const express = require('express');

const adminController = require('../controllers/admin');
const isAuth = require('../middleware/is-auth');

const router = express.Router();

router.get("/add-product", isAuth, adminController.getAddProduct);

//router.get("/add-category", isAuth, adminController.getAddCategory);

//router.get("/products", isAuth, adminController.getProduct);

module.exports = router;
