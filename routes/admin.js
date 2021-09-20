const path = require('path');

const express = require('express');

const adminController = require('../controllers/admin');
const isAuth = require('../middleware/is-auth');

const router = express.Router();

router.get("/add-product", isAuth, adminController.getAddProduct);

router.get("/add-category", isAuth, adminController.getAddCategory);

//router.get("/products", isAuth, adminController.getProduct);

router.post("/add-category", isAuth, adminController.postAddCategory);

router.post("/add-product", isAuth, adminController.postAddProduct);


module.exports = router;
