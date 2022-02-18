const Product = require("../models/product");
const Category = require("../models/category");
const QRCode = require("qrcode");
const { PDFDocument } = require("pdf-lib");
const fs = require("fs");

exports.getAddProduct = (req, res, next) => {
	/* Rendering site for add product, plus passing categories */
	Category.find()
		.then((categories) => {
			if (categories.length() !== 0) {
				res.render("admin/edit-product", {
					pageTitle: "Add Product",
					path: "/admin/add-product",
					categories: categories,
					product: "",
					error: NaN
				});
			} else {
				res.render("admin/edit-product", {
					pageTitle: "Add Product",
					path: "/admin/add-product",
					categories: categories,
					product: "",
					error: "Žádné kategorie!"
				});
			}
		})
		.catch((err) => console.log(err));
};

exports.postEditProduct = (req, res, next) => {
	productId = req.body.Id;
	/* Rendering site for add product, plus passing categories */
	Category.find()
		.then((categories) => {
			Product.findById(productId)
				.then((product) => {
					res.render("admin/edit-product", {
						pageTitle: "Add Product",
						path: "/admin/edit-product",
						categories: categories,
						product: product,
					});
				})
				.catch((err) => console.log(err));
		})
		.catch((err) => console.log(err));
};

exports.getAddCategory = (req, res, next) => {
	/* Rendering site for add collection */
	res.render("admin/add-category", {
		path: "/add-category",
		pageTitle: "Add category",
	});
};

exports.getQR = (req, res, next) => {
	/* Rendering view with all files that are in dir and dirTablesQR */
	

	const dir = "public/templates/";
	const dirTablesQR = "public/pdf/";

	//trying to read names of files in directories
	try {
		const files = fs.readdirSync(dir);
		const filesQR = fs.readdirSync(dirTablesQR);

		res.render("admin/make-qr", {
			path: "/make-qr",
			pageTitle: "Make QR code",
			templates: files,
			tablesQR: filesQR,
		});
	} catch (err) {
		console.log(err);
	}
};

exports.postQR = (req, res, next) => {
	/* creating new qr code and marging it with pdf template */

	const tableNumber = req.body.tableNumber; //table num.
	const templateTitle = req.body.radioCategory; //template

	//options for qr code maker
	const opts = {
		margin: 1,
		quality: 1,
		scale: 4,
		width: 256,
	};

	QRCode.toFile(
		"public/menus/qr.png",
		"https://" + req.headers.host.toString() + "/?table=" + tableNumber.toString(),
		opts
	) //passing url as data to be stored in QR code (req.headers.host.toString() is header of site so it should be dynamic)
		.then(() => {
			//loading the template from template dir
			PDFDocument.load(
				fs.readFileSync(`public/templates/${templateTitle}`)
			)
				.then((pdfDoc) => {
					//adding the QR code to the pdf
					pdfDoc
						.embedPng(fs.readFileSync("public/menus/qr.png"))
						.then((img) => {
							const imagePage = pdfDoc.getPages()[0]; //page num.
							imagePage.drawImage(img, {
								//drawing it on specific place with this options
								x: 310,
								y: 250,
								width: 256,
								height: 256,
							});

							//saving pdf with specific name that follow this rule table-${tableNumber}-template-${templateTitle}.pdf
							pdfDoc
								.save()
								.then((pdfBytes) => {
									const newFilePath = `public/pdf/table-${tableNumber}-template-${templateTitle}`;
									fs.writeFileSync(newFilePath, pdfBytes);
								})
								.catch((err) => console.log(err));
						})
						.catch((err) => console.log(err));
				})
				.catch((err) => console.log(err));
		})
		.catch((err) => {
			console.error(err);
		});
	res.redirect("/admin/make-qr");
};

exports.postAddCategory = (req, res, next) => {
	/* adding new category to db */
	const title = req.body.title;
	const image = req.file;
	//const url = req.body.url;
	const category = new Category({
		title: title,
		imageUrl: image.path.replace("public\\", "").replace("\\", "/"),
		url: "/menu#" + title.toLowerCase(),
		products: [],
	});
	category
		.save()
		.then(() => {
			res.redirect("add-category");
		})
		.catch((err) => console.log(err));
};

exports.postAddProduct = (req, res, next) => {
	console.log("postAddProduct")
	/* adding new product to db and pushing it to an array in proper category in db*/
	const title = req.body.title;
	const price = req.body.price;
	const description = req.body.description;
	const image = req.file;
	if (!image) {
		return res.status(422).render("admin/edit-product");
	}
	const category = req.body.radioCategory;
	const userId = req.body.userId;
	const productId = req.body.productId;
	const product = new Product({
		title: title,
		price: price,
		description: description,
		imageUrl: image.path.replace("public\\", ""), //taking path from file and removing public\ so it can show up on the site
		category: category,
		userId: userId,
	});
	//if product doesn't exist
	console.log(!productId)
	if (!productId) {
		console.log("new")
		product
			.save()
			.then((product) => {
				//adding product to category in db
				Category.findById(category)
					.then((categoryObj) => {
						const productsUpdate = [...categoryObj.products];
						productsUpdate.push({ productId: product._id });
						categoryObj.products = productsUpdate;
						categoryObj.save().catch((err) => console.log(err));
					})
					.catch((err) => console.log(err));
				res.redirect("/admin/add-product");
			})
			.catch((err) => console.log(err));
	} else {
		//if it exists just update it
		console.log("updating")
		Product.findOneAndUpdate(
			{ _id: productId },
			{
				title: title,
				price: price,
				description: description,
				imageUrl: image.path.replace("public\\", ""),
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
	//deleting product
	Product.findByIdAndDelete(productId)
		.then((product) => {
			//also deleting product from category
			Category.findById(product.category)
				.then((categoryObj) => {
					const productsToFilter = [ ...categoryObj.products ];
					const filteredProducts = productsToFilter.filter(obj => {
						return obj.productId.toString() !== product._id.toString();
					});
					categoryObj.products = filteredProducts;
					categoryObj.save().catch((err) => console.log(err));
				})
				.catch((err) => console.log(err));
			res.redirect("/menu");
		})
		.catch((err) => console.log(err));
};
