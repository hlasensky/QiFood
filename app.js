const path = require("path");

const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const session = require("express-session");
const MongoDBStore = require("connect-mongodb-session")(session);
const csrf = require("csurf");
const flash = require("connect-flash");
const mongoSanitize = require("express-mongo-sanitize");
const helmet = require("helmet");

const errorController = require("./controllers/error");
const User = require("./models/user");

require("dotenv").config();

const MONGODB_URI = process.env.MONGODB_URI;

const app = express();
const store = new MongoDBStore({
	uri: MONGODB_URI,
	collection: "sessions",
});

const csrfProtection = csrf();

app.set("view engine", "ejs");
app.set("views", "views");

const adminRoutes = require("./routes/admin");
const shopRoutes = require("./routes/shop");
const authRoutes = require("./routes/auth");

app.use(bodyParser.urlencoded({ extended: false }));
app.use(express.static(path.join(__dirname, "public")));
app.use(
	session({
		secret: "my secret",
		resave: false,
		saveUninitialized: false,
		store: store,
	})
);

app.use(express.json({ limit: "10kb" })); //limit to prevent DOS attacks
app.use(mongoSanitize()); //prevent NoSQL Injection Attacks
app.use(helmet());//Preventing XSS Attacks

// Sets "X-Frame-Options: DENY"
app.use(
	helmet.frameguard({
	  action: "deny",
	})
);

app.use((req, res, next) => {
	res.setHeader("X-Frame-Options", "ALLOW-FROM https://maps.google.com/");
	next();
});

app.use(csrfProtection);
app.use(flash());

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

app.use((req, res, next) => {
	res.locals.isAdmin = req.session.isAdmin;
	res.locals.isAuthenticated = req.session.isLoggedIn;
	res.locals.userId = req.session.userId;
	if (!req.session.user) {
		res.locals.productsForAfter = [];
	} else {
		const quantity = req.user.cart.items.map(
			(productQ) => productQ.quantity
		);
		let sum = quantity.reduce((partial_sum, a) => partial_sum + a, 0);
		res.locals.productsForAfter = sum;
	}
	res.locals.csrfToken = req.csrfToken();
	next();
});

app.use("/admin", adminRoutes);
app.use(shopRoutes);
app.use(authRoutes);

app.use(errorController.get404);

mongoose.set("useFindAndModify", false);

mongoose
	.connect(MONGODB_URI, { useNewUrlParser: true, useUnifiedTopology: true })
	.then(() => {
		app.listen(3000);
	})
	.catch((err) => {
		console.log(err);
	});
