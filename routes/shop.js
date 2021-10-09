const { check, body } = require("express-validator");

const express = require('express');

const shopController = require('../controllers/shop');
const isAuth = require('../middleware/is-auth');

const router = express.Router();

router.get("/", shopController.getIndex);

router.get("/menu", shopController.getMenu);

router.get("/kontakt", shopController.getKontakt);

router.get('/cart',  shopController.getCart);

router.post('/cart', shopController.postCart);

router.post('/order', shopController.postOrder);

router.get('/orders', shopController.getOrders);

router.post('/updateCart', [
    body("productQuantity", "Change only on munbers").isNumeric()
],  shopController.postUpdateCart);

router.post('/removeFormCart', [
    body("deleteProductId", "Bad ID").isAlphanumeric()
], shopController.postRemoveFormCart);

module.exports = router;
