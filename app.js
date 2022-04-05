const path = require("path");

//external modules
const express = require("express");
const mongoose = require("mongoose");
const session = require("express-session");
const MongoDBStore = require("connect-mongodb-session")(session);
const csrf = require("csurf");
const flash = require("connect-flash");
const mongoSanitize = require("express-mongo-sanitize");
const helmet = require("helmet");


//internal modules
const errorController = require("./controllers/error");
const User = require("./models/user");

//.env
require('dotenv').config();

const MONGODB_URI = process.env.MONGODB_URI; //taking mongoDB url from .env

const app = express();

//utilizing sessions
const store = new MongoDBStore({
	uri: MONGODB_URI,
	collection: "sessions",
});

const csrfProtection = csrf();

app.use(express.static(path.join(__dirname, "public")));

//setting views and engine for them
app.set("view engine", "ejs");
app.set("views", "views");

//importing routes
const adminRoutes = require("./routes/admin");
const shopRoutes = require("./routes/shop");
const authRoutes = require("./routes/auth");

//parser for urlencoded requests
app.use(express.urlencoded({ extended: false }));


//making new session
app.use(
	session({
		secret: process.env.SEDDION_SECRET,
		resave: false,
		cookie: {
			maxAge: 1000 * 60 * 60 * 12, // 12 hours
		},
		saveUninitialized: false,
		store: store,
	})
);

//security
app.use(express.json({ limit: "10kb" })); //limit to prevent DOS attacks
app.use(mongoSanitize()); //prevent NoSQL Injection Attacks
app.use(helmet()); //Preventing XSS Attacks
app.use(
	//this option permit to use iframes
	helmet.contentSecurityPolicy({
		useDefaults: true,
		directives: {
			"default-src":
				helmet.contentSecurityPolicy.dangerouslyDisableDefaultSrc,
		},
	})
);
app.use(csrfProtection);

//error handling
app.use(flash());

//saving user in req, if some exists
app.use((req, res, next) => {
	if (!req.session.user) {
		return next();
	}
	User.findById(req.session.user._id)
	.then((user) => {
		req.user = user;
		next();
	})
	.catch((err) => console.log(err));
});


//middleware for deleting expired anonymous users
app.use((req, res, next) => {
	if (req.session.user) {
		User.findById(req.session.user._id).then(user => {//deleting session for expired user
			if (!user) {
				req.session.destroy((err) => {
					console.log(err);
				});
			}
		}).catch((err) => console.log(err));
	}
	if (new Date().getHours()  === 12) {
		const date = Date.now();
		User.deleteMany({ expireDate: { $lt: date } }).then((result) => {//checking if the user expireDate is smaller them now
			console.log(result);
		}).catch((err) => console.log(err));
	}
	next()
});

app.use((req, res, next) => {
	//saving useful thinks in locals
	res.locals.isAdmin = req.session.isAdmin;
	res.locals.isAuthenticated = req.session.isLoggedIn;
	res.locals.userId = req.session.userId;
	res.locals.csrfToken = req.csrfToken();
	//counting how much products user have in cart and saving the quantity to locals
	if (!req.session.user) {
		res.locals.productsForAfter = [];
	} else {
		const quantity = req.user.cart.items.map(
			(productQ) => productQ.quantity
		);
		let sum = quantity.reduce((partial_sum, a) => partial_sum + a, 0);
		res.locals.productsForAfter = sum;
	}
	next();
});

//routes
app.use("/admin", adminRoutes);
app.use(shopRoutes);
app.use(authRoutes);
app.use(errorController.get404); //404 error handling

mongoose
	.connect(MONGODB_URI, { useNewUrlParser: true, useUnifiedTopology: true })
	.then(() => {
		app.listen(process.env.PORT || 3000, 
			() => console.log("Server is running..."));
	})
	.catch((err) => {
		console.log(err);
	});