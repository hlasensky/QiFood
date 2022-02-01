const bcrypt = require("bcryptjs");
const { validationResult } = require("express-validator");

const User = require("../models/user");

exports.postLogout = (req, res, next) => {
	/* destroying session(logging out) */
	req.session.destroy((err) => {
		console.log(err);
		res.redirect("/");
	});
};

exports.getLogin = (req, res, next) => {
	/* rendering logging site */
	let message = req.flash("error");
	if (message.length > 0) {
		message = message[0];
	} else {
		message = null;
	}
	res.render("auth/login", {
		path: "/login",
		pageTitle: "Login",
		errorMessage: message,
		oldInput: { email: "", password: ""},
		validationErrors: []
	});
};

exports.getSignup = (req, res, next) => {
	/* rendering signup site */
	let message = req.flash("error");
	if (message.length > 0) {
		message = message[0];
	} else {
		message = null;
	}
	res.render("auth/signup", {
		path: "/signup",
		pageTitle: "Signup",
		errorMessage: message,
		oldInput: { email: "", password: "", confirmPassword: "" },
		validationErrors: []
	});
};

exports.postSignup = (req, res, next) => {
	/* looking to db if user already exists, if not creating new one */
	const errors = validationResult(req);
	const email = req.body.email;
	const password = req.body.password;
	const confirmPassword = req.body.confirmPassword;
	if (!errors.isEmpty()) {
		console.log(errors.array());
		return res.status(422).render("auth/signup", {
			path: "/signup",
			pageTitle: "Signup",
			errorMessage: errors.array()[0].msg,
			oldInput: { email: email, password: password, confirmPassword: confirmPassword },
			validationErrors: errors.array(),
		});
	}
	User.findOne({ email: email })
		.then((user) => {
			return (
				bcrypt
					//creating hashed password
					.hash(password, 12)
					.then((hashedPassword) => {
						const user = new User({
							email: email,
							password: hashedPassword,
							isAdmin: false,
							cart: { items: [] },
						});
						return user.save();
					})
					.then(() => {
						res.redirect("/login");
					})
			);
		})
		.catch((err) => {
			console.log(err);
		});
};

exports.postLogin = (req, res, next) => {
	/* looking to db if user enter valid user information */
	const errors = validationResult(req);
	const email = req.body.email;
	const password = req.body.password;
	if (!errors.isEmpty()) {
		console.log(errors.array()[0]);
		return res.status(422).render("auth/login", {
			path: "/login",
			pageTitle: "Login",
			errorMessage: errors.array()[0].msg,
			oldInput: { email: email, password: password },
			validationErrors: errors.array(),
		});
	}
	//compering passwords with bcrypt.compare
	User.findOne({ email: email }).then((user) => {
		bcrypt
			.compare(password, user.password)
			.then((doMatch) => {
				console.log(doMatch);
				if (doMatch) {
					//adding useful information in session for later use
					req.session.isLoggedIn = true;
					req.session.user = user;
					req.session.isAdmin = user.isAdmin;
					req.session.userId = user._id;
					res.redirect("/");
				} else {
					res.redirect("/login");
				}
			})
			.catch((err) => {
				console.log(err);
				res.redirect("/login");
			});
	}).catch((err) => console.log(err));
};
