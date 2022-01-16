const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const orderSchema = new Schema({
	products: [
		{
			productId: {
				type: Schema.Types.ObjectId,
				required: true,
				ref: "Product",
			},
			quantity: { type: Number, required: true },
		},
	],
	table: {},
	name: { type: String },
	phoneNumber: { type: String },
	address: { type: String },
	payment: { type: String },
	userId: {
		type: Schema.Types.ObjectId,
		required: true,
		ref: "User",
	},
	date: { type: Date, default: Date.now }
});


module.exports = mongoose.model("Order", orderSchema);
