const Product = require("../models/product");
const Category = require("../models/category");
const product = require("../models/product");

exports.getAddProduct = (req, res, next) => {
	/* Rendering site for add product, plus passing categoryes */
	Category.find()
		.then((categoryes) => {
			res.render("admin/edit-product", {
				pageTitle: "Add Product",
				path: "/admin/add-product",
				categoryes: categoryes,
				product: "",
			});
		})
		.catch((err) => console.log(err));
};

exports.postEditProduct = (req, res, next) => {
	productId = req.body.productId;
	/* Rendering site for add product, plus passing categoryes */
	Category.find()
		.then((categoryes) => {
			Product.findById(productId)
				.then((product) => {
					res.render("admin/edit-product", {
						pageTitle: "Add Product",
						path: "/admin/edit-product",
						categoryes: categoryes,
						product: product,
					});
				})
				.catch((err) => console.log(err));
		})
		.catch((err) => console.log(err));
};

exports.getAddCategory = (req, res, next) => {
	/* Rendering site for add colection */
	res.render("admin/add-category", {
		path: "/add-category",
		pageTitle: "Add category",
	});
};

exports.postAddCategory = (req, res, next) => {
	/* adding new category to db */
	const title = req.body.title;
	const imageUrl = req.body.imageUrl;
	const url = req.body.url;
	const category = new Category({
		title: title,
		imageUrl: imageUrl,
		url: url,
		products: []
	});
	category
		.save()
		.then(() => {
			res.redirect("/add-category");
		})
		.catch((err) => console.log(err));
};

exports.postAddProduct = (req, res, next) => {
	/* adding new product to db and pushing it to an array in proper category in db*/
	const title = req.body.title;
	const price = req.body.price;
	const description = req.body.description;
	const imageUrl = req.body.imageUrl;
	const category = req.body.radioCategory;
	const userId = req.body.userId;
	const productId = req.body.Id;
	const product = new Product({
		title: title,
		price: price,
		description: description,
		imageUrl: imageUrl,
		category: category,
		userId: userId,
	});
	if (!productId) {
		product
			.save()
			.then((product) => {
				Category.findById(category)
					.then((categoryObj) => {
						const productsUpdate = [
							...categoryObj.products,
						];
						productsUpdate.push({ productId: product._id });
						categoryObj.products = productsUpdate;
						categoryObj.save().catch((err) => console.log(err));
					})
					.catch((err) => console.log(err));
				res.redirect("/admin/add-product");
			})
			.catch((err) => console.log(err));
	} else {
		Product.findOneAndUpdate(
			{ _id: productId },
			{
				title: title,
				price: price,
				description: description,
				imageUrl: imageUrl,
				category: category,
				userId: userId,
			}
		)
			.then(() => {
				console.log("updated");
				res.redirect("/admin/add-product");
			})
			.catch((err) => console.log(err));
	}
};

exports.postDeleteProduct = (req, res, next) => {
	/* adding new product to db and pushing it to an array in proper category in db*/
	const productId = req.body.Id;
	Product.findByIdAndDelete(productId)
		.then((product) => {
			Category.findById(product.category)
				.then((categoryObj) => {
					let productsUpdate = [
						...categoryObj.products,
					];

					productsUpdate = productsUpdate.filter(obj => {
						
						obj.productId !== product._id
					})

					
					categoryObj.products = productsUpdate;
					categoryObj.save().catch((err) => console.log(err));
				})
				.catch((err) => console.log(err));
			res.redirect("/menu");
		})
		.catch((err) => console.log(err));
};
