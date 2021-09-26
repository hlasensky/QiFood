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
	createdAt: {},

	resetToken: String,
	resetTokenExpiration: Date,
});

userSchema.methods.addToCart = function (product, productQuantity) {
	const productId = product._id.toString();
	const cartList = [...this.cart.items];
	const found = cartList.find(
		(foundProduct) =>
			foundProduct.productId.toString() === productId.toString()
	);

	if (!found) {
		cartList.push({
			productId: productId,
			quantity: productQuantity,
		});
	} else {
		const index = cartList.indexOf(found);
		if (index !== -1) {
			cartList.splice(index, 1);
		}
		const newQuantity = Number(found.quantity) + Number(productQuantity);
		found.quantity = newQuantity;
		cartList.push(found);
	}

	const updatedCart = {
		items: cartList,
	};
	this.cart = updatedCart;
	return this.save().catch((err) => console.log(err));
};

userSchema.methods.updateCart = function (product, productQuantity) {
	const productId = product._id.toString();
	const cartList = [...this.cart.items];
	const found = cartList.find(
		(foundProduct) =>
			foundProduct.productId.toString() === productId.toString()
	);

	const index = cartList.indexOf(found);
	if (index !== -1) {
		cartList.splice(index, 1);
	}
	const newQuantity = Number(productQuantity);
	found.quantity = newQuantity;
	cartList.push(found);

	const updatedCart = {
		items: cartList,
	};
	this.cart = updatedCart;
	return this.save().catch((err) => console.log(err));
};

userSchema.methods.removeFromCart = function (productId) {
	const cartProductId = productId.toString();
	const cartList = [...this.cart.items];
	const found = cartList.find(
		(foundProduct) =>
			foundProduct._id.toString() === cartProductId.toString()
	);

	const index = cartList.indexOf(found);
	if (index !== -1) {
		cartList.splice(index, 1);
	}

	const updatedCart = {
		items: cartList,
	};
	this.cart = updatedCart;
	return this.save().catch((err) => console.log(err));
};

module.exports = mongoose.model("User", userSchema);
