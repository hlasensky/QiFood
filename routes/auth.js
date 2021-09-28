const express = require("express");
const { check, body } = require("express-validator");

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
        body("password", "Enter password at least 5 characters long.")
        .isLength(
			{ min: 5 }
		),
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
				throw new Error("Password have to match!");
			}
		}),
	],
	authController.postSignup
);

router.post("/logout", authController.postLogout);

module.exports = router;
