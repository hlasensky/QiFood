const { check, body } = require("express-validator");
const express = require('express');

const adminController = require('../controllers/admin');
const isAuth = require('../middleware/is-auth');

const Category = require('../models/category');

const router = express.Router();

router.get("/add-product", isAuth, adminController.getAddProduct);

router.get("/add-category", isAuth, adminController.getAddCategory);

router.post("/edit-product", isAuth, adminController.postEditProduct);

router.post("/add-category", [

], isAuth, adminController.postAddCategory);

router.post("/add-product",
    body("category").custom((url) => {
        Category
        .findById(url)
        .then(result => {
            if (!result) {
                return Promise.reject(
                    "Choose valid category!"
                );
            }
    })
}), isAuth, adminController.postAddProduct);


module.exports = router;
