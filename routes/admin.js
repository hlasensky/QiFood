const { check, body } = require("express-validator");
const express = require('express');

const adminController = require('../controllers/admin');
const isAuth = require('../middleware/is-auth');

const Category = require('../models/category');

const router = express.Router();

router.get("/add-product", isAuth, adminController.getAddProduct);

router.get("/add-category", isAuth, adminController.getAddCategory);

router.post("/edit-product", isAuth, adminController.postEditProduct);

router.post("/delete-product", isAuth, adminController.postDeleteProduct);

router.post("/add-category", [

], isAuth, adminController.postAddCategory);

router.post("/add-product",
    body("radioCategory")
        .custom((url) => {
        Category
            .findById(url)
                .then(result => {
                if (!result) {
                    return Promise.reject(
                        "Choose valid category!"
                    );
                }
        }).catch((err) => console.log(err));
}), isAuth, adminController.postAddProduct);


module.exports = router;
