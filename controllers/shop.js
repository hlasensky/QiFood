const Product = require("../models/product");
const Category = require("../models/category");
const Order = require("../models/order");
const User = require("../models/user");
const bcrypt = require("bcryptjs");
const { validationResult } = require("express-validator");
const CoinGecko = require("coingecko-api");
const { numberToString } = require("pdf-lib");
require("dotenv").config();

const ACCOUNT = process.env.ACCOUNT;

exports.getIndex = (req, res, next) => {
	/* rendering landing page with fetched data from category collection */
	if (!req.session.user) {
		/* this part make anonym user for every new visite of landing page */
		bcrypt
			.hash(Math.random().toString(), 12)
			.then((hashedPassword) => {
				const date = Date.now() + 43200000;
				const user = new User({
					email: "anonym",
					password: hashedPassword,
					isAdmin: false,
					cart: { items: [] },
					expireDate: date /*adding expire time */,
				});

				user.save()
					.then((user) => {
						req.session.isLoggedIn = false;
						req.session.user = user;
						req.session.isAdmin = user.isAdmin;
						return req.session.save((err) => {
							console.log(err);
						});
					})
					.catch((err) => console.log(err));
			})
			.catch((err) => console.log(err));
	}
	if (req.query.table) {
		req.session.table = req.query.table;
	}

	Category.find()
		.then((categoryes) => {
			res.render("shop/index", {
				categoryes: categoryes,
				pageTitle: "QiFood",
				path: "/",
			});
		})
		.catch((err) => {
			console.log(err);
		});
};

exports.getMenu = (req, res, next) => {
	/* rendering menu page with fetched data from category collection and populating array of products*/
	Category.find()
		.populate({
			path: "products.productId",
		})
		.exec(function (err, categoryes) {
			res.render("shop/menu", {
				pageTitle: "Menu",
				path: "/menu",
				categoryes: categoryes,
				dot: ".",
			});
		});
};

exports.getKontakt = (req, res, next) => {
	/* rendering contact page*/
	res.render("shop/contakt", {
		pageTitle: "Kontakt",
		path: "/kontakt",
	});
};

exports.getCart = (req, res, next) => {
	/* render cart with user's cart */
	User.findById(req.user)
		.populate({
			path: "cart.items.productId",
		})
		.exec(function (err, products) {
			res.render("shop/cart", {
				pageTitle: "Košík",
				path: "/cart",
				products: products.cart.items,
				totalPrice: req.user.totalPrice(products.cart.items),
				table: req.session.table,
			});
		});
};

exports.postCart = (req, res, next) => {
	/* add product with quantity to user's cart using  schema method*/
	productId = req.body.productId;
	productQuantity = req.body.productQuantity;
	Product.findById(productId)
		.then((product) => {
			req.user.addToCart(product, productQuantity);
		})
		.then(() => {
			res.status(202).redirect("/menu");
		})
		.catch((err) => console.log(err));
};

exports.postUpdateCart = (req, res, next) => {
	/* update products and quantity in user's cart using schema method*/
	productId = req.body.productId;
	productQuantity = req.body.productQuantity;
	Product.findById(productId)
		.then((product) => {
			req.user.updateCart(product, productQuantity);
		})
		.then(() => {
			res.status(202).redirect("/cart");
		})
		.catch((err) => console.log(err));
};

exports.postRemoveFormCart = (req, res, next) => {
	/* remove product from user's cart using  schema method*/
	productId = req.body.deleteProductId;
	req.user
		.removeFromCart(productId)
		.then(() => {
			res.status(202).redirect("/cart");
		})
		.catch((err) => console.log(err));
};

exports.postOrder = (req, res, next) => {
	//looking for every order that user made and adding new one from cart
	const name = req.body.nameAndSecondname;
	const phoneNumber = req.body.phoneNumber;
	const shipAddress = req.body.shipAddress;
	if (!req.session.table) {
		const errors = validationResult(req);
		if (!errors.isEmpty()) {
			console.log(errors.array());
			return res.status(422).render("shop/delivery", {
				pageTitle: "Doprava a platba",
				path: "/doruceni",
				errorMessage: errors.array()[0].msg,
				oldInput: {
					name: name,
					phoneNumber: phoneNumber,
					shipAddress: shipAddress,
				},
				validationErrors: errors.array(),
				pay: "",
				params: ""
			});
		}
	}

	let order;
	User.findById(req.user)
		.populate({
			path: "cart.items.productId",
		})
		.exec(function (err, user) {
			const orderList = [...user.cart.items];
			const updatedOrderList = [];
			orderList.forEach((product) => {
				updatedOrderList.push({
					productId: product.productId,
					quantity: product.quantity,
				});
			});
			if (req.session.table) {
				order = new Order({
					products: updatedOrderList,
					userId: req.user._id,
					table: req.session.table,
				});
			} else {
				order = new Order({
					products: updatedOrderList,
					userId: req.user._id,
					name: name,
					phoneNumber: phoneNumber,
					address: shipAddress,
					payment: "pending",
				});
			}
			order
				.save()
				.then(() => {
					if (req.session.table) {
						res.status(202).redirect("/orders");
						req.user.removeCart();
					} else {
						res.status(202).redirect("/pay");
					}
				})
				.catch((err) => console.log(err));
		});
};

exports.postPay = (req, res, next) => {
	//looking for every order that user made and adding new one from cart
	const metaError = req.body.metaError;
	const paymentMethod = "eth"; //req.body.paymentMethod;
	console.log(metaError, "metaError")
	if (!metaError) {
		Order.updateOne(
			{ userId: req.user },
			{ payment: "done with " + paymentMethod }
		)
			.then(() => {
				//res.status(202).redirect("/orders");
				req.user.removeCart();
			})
			.catch((err) => console.log(err));
	} else {
		res.render("shop/payment", {
			pageTitle: "Doprava a platba",
			path: "/doruceni",
			validationErrors: [],
			errorMessage: "Něco se pokazilo",
			oldInput: {
				name: "",
				phoneNumber: "",
				shipAddress: "",
			},
			params: "",
			pay: "true",
		});
	}
};

exports.getOrderAndDelivery = (req, res, next) => {
	res.render("shop/delivery", {
		pageTitle: "Doprava a platba",
		path: "/doruceni",
		validationErrors: [],
		errorMessage: "",
		oldInput: {
			name: "",
			phoneNumber: "",
			shipAddress: "",
		},
	});
};

//get fixed this shit
exports.getPay = (req, res, next) => {
	const CoinGeckoClient = new CoinGecko();
	CoinGeckoClient.simple
		.price({
			ids: "ethereum",
			vs_currencies: "czk",
		})
		.then((price) => {
			const ethPrice = price.data.ethereum.czk;
			User.findById(req.user)
				.populate({
					path: "cart.items.productId",
				})
				.exec(function (err, products) {
					console.log(req.user.totalPrice(products.cart.items));
					const data = {
						to: ACCOUNT,
						value:
							"0x" +
							(
								Math.floor((req.user.totalPrice(products.cart.items) /
									ethPrice) *
								10 ** 18)
							).toString(16),
						gas: "0x2710",
					};
					res.render("shop/payment", {
						pageTitle: "Doprava a platba",
						path: "/doruceni",
						validationErrors: [],
						errorMessage: "",
						oldInput: {
							name: "",
							phoneNumber: "",
							shipAddress: "",
						},
						params: data,
						pay: "true",
					});
				});
		});
};

exports.getOrders = (req, res, next) => {
	//rendering orders in summed form
	populatedOrders = [];

	//function that summariz orders so they show only ID, price, quantity and date
	const summary = (orders) => {
		const summedOrders = [];
		orders.forEach((order) => {
			const priceArray = order.products.map((product) => {
				return product.productId.price * product.quantity;
			});
			const quantityArray = order.products.map((product) => {
				return product.quantity;
			});

			const sumedPrices = priceArray.reduce((a, b) => a + b);
			const sumedQuantities = quantityArray.reduce((a, b) => a + b);
			summedOrders.push({
				orderId: order._id,
				totalPrice: sumedPrices,
				totalQuantity: sumedQuantities,
				date: order.date,
			});
		});

		return summedOrders;
	};

	//finding all orders that user made, populating them and passing them to summary function
	Order.find({ userId: req.user._id })
		.then((orders) => {
			if (orders.length === 0) {
				res.render("shop/orders", {
					pageTitle: "Objednávky",
					path: "/orders",
					orders: [],
					validationErrors: [],
				});
			} else {
				orders.forEach((order) => {
					Order.findOne(order)
						.populate("products.productId")
						.exec((err, populatedOrder) => {
							populatedOrders.push(populatedOrder);
							if (populatedOrders.length === orders.length) {
								res.render("shop/orders", {
									pageTitle: "Objednávky",
									path: "/orders",
									orders: summary(populatedOrders),
									validationErrors: [],
								});
							}
						});
				});
			}
		})
		.catch((err) => console.log(err));
};

exports.getOrderDetail = (req, res, next) => {
	//rendering detail of order
	const orderId = req.query.Id;
	if (!orderId) {
		return res.redirect("/orders");
	}

	//finding and population specific order
	Order.findById(orderId)
		.populate("products.productId")
		.exec((err, populatedOrder) => {
			res.render("shop/orderDetail", {
				pageTitle: "Objednávky",
				path: "/order-detail",
				order: populatedOrder,
			});
		});
};
