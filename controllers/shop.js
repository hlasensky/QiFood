const Product = require("../models/product");
const Category = require("../models/category");
const Order = require("../models/order");
const User = require("../models/user");
const bcrypt = require("bcryptjs");

exports.getIndex = (req, res, next) => {
	/* rendering landing page with fetched data from category collection */
	if (!req.session.user) {
		/* this part make anonym user for every new visite of landing page */
		bcrypt
			.hash(Math.random().toString(), 12)
			.then((hashedPassword) => {
				const user = new User({
					email: "anonym",
					password: hashedPassword,
					isAdmin: false,
					cart: { items: [] },
					expireAt: {
						/*adding expire time */
						type: Date,
						index: { expires: "3000s" },
					},
				});

				user.save()
					.then((user) => {
						req.session.isLoggedIn = false;
						req.session.user = user;
						req.session.isAdmin = user.isAdmin;
						req.session.userId = user._id;
						return req.session.save((err) => {
							console.log(err);
						});
					})
					.catch((err) => console.log(err));
			})
			.catch((err) => console.log(err));
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
	productId = req.body.Id;
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
			const order = new Order({
				products: updatedOrderList,
				user: req.user._id,
			});
			order
				.save()
				.then(() => {
					res.status(202).redirect("/orders");
					req.user.removeCart();
				})
				.catch((err) => console.log(err));
		});
};

exports.getOrders = (req, res, next) => {
	populatedOrders = [];

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

	Order.find({ userId: req.userId })
		.then((orders) => {
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
							});
						}
					});
			});
		})
		.catch((err) => console.log(err));
};

exports.getOrderDetail = (req, res, next) => {
	const orderId = req.query.Id;
	if (!orderId) {
		return res.redirect("/orders");
	}
	
	Order.findById(orderId)
		.populate("products.productId")
		.exec((err, populatedOrder) => {
			console.log(populatedOrder)
			res.render("shop/orderDetail", {
				pageTitle: "Objednávky",
				path: "/order-detail",
				order: populatedOrder,
			});
			
		});
};
