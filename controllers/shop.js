const Product = require("../models/product");
const Category = require("../models/category");
const Order = require("../models/order");
const User = require("../models/user");
const bcrypt = require("bcryptjs");

exports.getIndex = (req, res, next) => {
	/* rendering landing page with fetched data from category collection */
	if (!req.session.user) {
		bcrypt
			.hash(Math.random().toString(), 12)
			.then((hashedPassword) => {
				const user = new User({
					email: "anonym",
					password: hashedPassword,
          isAdmin: false,
          cart: { items: [] },
					expireDate: { type: Date, expires: 60 * 60 * 24 }
				});
				user.save()
          .then((user) => {
						req.session.isLoggedIn = true;
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
			path: "products.productsArray.productId",
		})
		.exec(function (err, categoryes) {
			res.render("shop/menu", {
				pageTitle: "Menu",
				path: "/menu",
        categoryes: categoryes,
        dot: "."
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
	res.render("shop/cart", {
		pageTitle: "Košík",
		path: "/cart",
		products: "", //doplnit
	});
};

exports.postCart = (req, res, next) => {
	productId = req.body.productId;
	productQuantity = req.body.productQuantity;
	Product.findById(productId)
		.then((product) => {
			req.user
				.addToCart(product, productQuantity)
		}).catch((err) => console.log(err));
};
