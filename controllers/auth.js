const bcrypt = require("bcryptjs");
const crypto = require("crypto");
const { validationResult } = require("express-validator");

const User = require("../models/user");


exports.postLogout = (req, res, next) => {
	/* destroing session(logging out) */
	req.session.destroy((err) => {
		console.log(err);
		res.redirect("/");
	});
};


exports.getLogin = (req, res, next) => {
	/* rendering loggin site */
	res.render("auth/login", {
		path: "/login",
		pageTitle: "Login",
        errorMessage: "",
        
	});
};

exports.getSignup = (req, res, next) => {
	/* rendering signup site */
	res.render("auth/signup", {
		path: "/signup",
		pageTitle: "Signup",
		errorMessage: "",
	});
};

exports.postSignup = (req, res, next) => {
	/* looking to db if user allready exists, if not creating new one */
	const email = req.body.email;
	const password = req.body.password;
	User.findOne({ email: email })
		.then((user) => {
			return bcrypt
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
				});
		})
		.catch((err) => {
			console.log(err);
		});
};

exports.postLogin = (req, res, next) => {
	/* looking to db if user enter valide user information */
	const email = req.body.email;
	const password = req.body.password;
	User.findOne({ email: email }).then((user) => {
		if (!user) {
			req.flash("error", "Invalid email or password.");
			return res.redirect("/login");
		}
		//compering passords with bcrypt.compare
		bcrypt
			.compare(password, user.password)
            .then((doMatch) => {
                console.log(doMatch)
				if (doMatch) {
					//adding useful information in session for later use
					req.session.isLoggedIn = true;
					req.session.user = user;
					req.session.isAdmin = user.isAdmin;
					req.session.userId = user._id;
					return req.session.save((err) => {
						console.log(err);
						res.redirect("/");
					});
				}
				res.redirect("/login");
			})
			.catch((err) => {
				console.log(err);
				res.redirect("/login");
			});
	});
};
