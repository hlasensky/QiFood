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
	user: {
		type: Schema.Types.ObjectId,
		required: true,
		ref: "User",
	},
	date: { type: Date, default: Date.now }
});


module.exports = mongoose.model("Order", orderSchema);
