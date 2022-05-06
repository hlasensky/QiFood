const { check, body } = require("express-validator");
const express = require('express');

const adminController = require('../controllers/admin');
const isAuth = require('../middleware/is-auth');
const uploader = require('../middleware/fileUploaders');

const Category = require('../models/category');

const router = express.Router();

router.get("/add-product", isAuth, adminController.getAddProduct);

router.get("/add-category", isAuth, adminController.getAddCategory);

router.get("/make-qr", isAuth, adminController.getQR);

router.post("/make-qr", isAuth, adminController.postQR);

router.post("/upload-template", isAuth, uploader.templatePdf);

router.post("/edit-product", isAuth, adminController.postEditProduct);

router.post("/delete-product", isAuth, adminController.postDeleteProduct);

router.post("/add-category", isAuth, uploader.categoryImage, adminController.postAddCategory);

router.post("/delete-category", isAuth, adminController.postDeleteCategory);

router.post("/add-product", isAuth, uploader.productImage, adminController.postAddProduct);

module.exports = router;
