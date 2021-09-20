const Product = require("../models/product");
const Category = require("../models/category");

exports.getAddProduct = (req, res, next) => {
	Category.find()
		.then((categoryes) => {
			res.render("admin/edit-product", {
				pageTitle: "Add Product",
				path: "/admin/add-product",
				editing: false,
				categoryes: categoryes,
			});
		})
		.catch((err) => console.log(err));
};

exports.getAddCategory = (req, res, next) => {
	res.render("admin/add-category", {
		path: "/add-category",
		pageTitle: "Add category",
	});
};

exports.postAddCategory = (req, res, next) => {
	const title = req.body.title;
	const imageUrl = req.body.imageUrl;
	const url = req.body.url;
	const category = new Category({
		title: title,
		imageUrl: imageUrl,
		url: url,
		products: { productsArray: [] },
	});
	category
		.save()
		.then(() => {
			res.redirect("/add-category");
		})
		.catch((err) => console.log(err));
};

exports.postAddProduct = (req, res, next) => {
	const title = req.body.title;
	const price = req.body.price;
	const description = req.body.description;
	const imageUrl = req.body.imageUrl;
	const category = req.body.radioCategory;
	const userId = req.body.userId;
	const product = new Product({
		title: title,
		price: price,
		description: description,
		imageUrl: imageUrl,
		category: category,
		userId: userId,
	});
	product
		.save()
		.then((product) => {
			Category.findById(category)
				.then((categoryObj) => {
					const productsUpdate = [
						...categoryObj.products.productsArray
					];
					productsUpdate.push({ productId: product._id });
					const updatedProducts = { productsArray: productsUpdate };
					categoryObj.products = updatedProducts;
					categoryObj.save();
				})
				.catch((err) => console.log(err));
			res.redirect("/admin/add-product");
		})
		.catch((err) => console.log(err));
};
