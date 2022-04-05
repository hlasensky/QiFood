const { body } = require("express-validator");

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

router.get('/orderNoTable', shopController.getOrderAndDelivery);

router.post('/orderNoTable', [
    body("nameAndSecondname").custom(value => {
        if (!value) {
            return Promise.reject('Prosím vyplňte vaše jméno!');
        } else {
            return true
        }
    }),
    body("phoneNumber").custom(value => {
        if (!Number(value.split(" ").join(""))) {
            return Promise.reject('Prosím vyplňte správně váše telefoní číslo!');
        }
        if (value.split(" ").join("").length !== 9) {
            return Promise.reject('Prosím vyplňte váše telefoní číslo v plné délce!');
        } 
        if (!value) {
            return Promise.reject('Prosím vyplňte váš telefon!');
        } else {
            return true
        }
    }),
    body("shipAddress").custom(value => {
        if (!value) {
            return Promise.reject('Prosím vyplňte adresu!');
        } else {
            return true
        }
    }),
], shopController.postOrder);

router.get('/pay', shopController.getPay);

router.post('/pay',
    body("amount").custom(value => {
        checkValue = "0x" + Math.floor((req.user.totalPrice(products.cart.items) / ethPrice) * 10 ** 18).toString(16)
        if (value !== checkValue) {
            return Promise.reject("Error!");
        } else {
            return true;
        }
    }),shopController.postPay);


router.get('/order-detail:Id', shopController.getOrderDetail);

router.post('/updateCart', [
    body("productQuantity", "Change only on numbers").isNumeric()
],  shopController.postUpdateCart);

router.post('/removeFormCart', [
    body("deleteProductId", "Bad ID").isAlphanumeric()
], shopController.postRemoveFormCart);

module.exports = router;
