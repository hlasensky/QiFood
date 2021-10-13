const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const userSchema = new Schema({
	email: {
		type: String,
		required: true,
	},
	password: {
		type: String,
		required: true,
	},
	isAdmin: {
		type: Boolean,
		required: true,
	},
	cart: {
		items: [
			{
				productId: {
					type: Schema.Types.ObjectId,
					ref: "Product",
					required: true,
				},
				quantity: { type: Number, required: true },
			},
		],
	},
	expireAt: {},

	resetToken: String,
	resetTokenExpiration: Date,
});

userSchema.methods.addToCart = function (product, productQuantity) {
	/* this method add or change quantity of product */
	const productId = product._id.toString();
	const cartList = [...this.cart.items];

	/* This metod try to find product in cart, if it fails, it return undefined else it return the object */
	const foundProduct = cartList.find(
		(found) => found.productId.toString() === productId.toString()
	);

	if (!foundProduct) {
		cartList.push({
			productId: productId,
			quantity: productQuantity,
		});
	} else {
		/* updating quantity of product */
		const index = cartList.indexOf(foundProduct);
		/* removing old object from cartList*/
		if (index !== -1) {
			cartList.splice(index, 1);
		}
		/* making new quantity */
		const newQuantity =
			Number(foundProduct.quantity) + Number(productQuantity);
		/* passing new quantity to product */
		foundProduct.quantity = newQuantity;
		cartList.push(foundProduct);
	}
	/* making desirable data structure */
	const updatedCart = {
		items: cartList,
	};
	/* updating cart for 'this' user */
	this.cart = updatedCart;
	return this.save().catch((err) => console.log(err));
};

userSchema.methods.updateCart = function (product, productQuantity) {
	/* this method update quantity of product */
	const productId = product._id.toString();
	const cartList = [...this.cart.items];
	const foundProduct = cartList.find(
		(found) => found.productId.toString() === productId.toString()
	);

	const index = cartList.indexOf(foundProduct);
	if (index !== -1) {
		cartList.splice(index, 1);
	}
	const newQuantity = Number(productQuantity);
	foundProduct.quantity = newQuantity;
	cartList.push(foundProduct);

	const updatedCart = {
		items: cartList,
	};
	this.cart = updatedCart;
	return this.save().catch((err) => console.log(err));
};

userSchema.methods.removeFromCart = function (productId) {
	/* this method remove product from cart */
	const cartProductId = productId.toString();
	const cartList = [...this.cart.items];
	const foundProduct = cartList.find(
		(found) => found._id.toString() === cartProductId.toString()
	);

	const index = cartList.indexOf(foundProduct);
	if (index !== -1) {
		cartList.splice(index, 1);
	}

	const updatedCart = {
		items: cartList,
	};
	this.cart = updatedCart;
	return this.save().catch((err) => console.log(err));
};

userSchema.methods.removeCart = function () {
	const updatedCart = {
		items: [],
	};
	this.cart = updatedCart;
	return this.save().catch((err) => console.log(err));
};

userSchema.methods.totalPrice = function (products) {
	const arrayProduct = products.map((product) => {
		product.productId.price * product.quantity;
	});
	
	if (arrayProduct.length === 0) {
		return [];
	} else {
		const sum = arrayProduct.reduce((a, b) => a + b);
		return sum;
	}
};

module.exports = mongoose.model("User", userSchema);
