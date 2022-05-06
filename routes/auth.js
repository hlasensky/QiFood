const express = require("express");
const { check, body } = require("express-validator");
const bcrypt = require("bcryptjs");

const User = require("../models/user");

const authController = require("../controllers/auth");

const router = express.Router();

router.get("/login", authController.getLogin);

router.get("/signup", authController.getSignup);

router.post(
	"/login",
	[
		body("email", "Please enter a valid email.").isEmail().custom((email, { req }) => {
			return User.findOne({ email: email }).then((user) => {
				if (!user) {
					return Promise.reject(
						"Wrong email or password!"
					);
				}
			});
		}),
		body("password", "Enter valid email or password").custom((password) => {
			return User.findOne({ email: email }).then((user) => {
				bcrypt
					.compare(password, user.password)
					.then((doMatch) => {
						console.log(email, password);
						if (!doMatch) {
							return Promise.reject(
								"Wrong email or password!"
							);
						}
					})
			}).catch((err) => console.log(err))
		})
	],
	authController.postLogin
);

router.post(
	"/signup",
	[
		check("email")
			.isEmail()
			.withMessage("Please enter a valid email.")
			.custom((email, { req }) => {
				return User.findOne({ email: email }).then((user) => {
					if (user) {
						return Promise.reject(
							"E-Mail exists already, please pick a different one."
						);
					}
				});
			}),
		body("password", "Enter password at least 5 characters long.").isLength(
			{ min: 5 }
		),
		body("confirmPassword").custom((value, { req }) => {
			if (value !== req.body.password) {
				return Promise.reject("Password have to match!");
			} else {
				return true
			}
		}),
	],
	authController.postSignup
);

router.post("/logout", authController.postLogout);

module.exports = router;
