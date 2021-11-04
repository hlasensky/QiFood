const Product = require("../models/product");
const Category = require("../models/category");
const QRCode = require("qrcode");
const { PDFDocument } = require('pdf-lib');
const fs = require("fs");

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

exports.getQR = (req, res, next) => {
	/* Rendering site for add colection */

	const dir = 'public/templates/';

	const dirTablesQR = 'public/pdf/';

	try {
		const files = fs.readdirSync(dir);
		const filesQR = fs.readdirSync(dirTablesQR);
		
		res.render("admin/make-qr", {
			path: "/make-qr",
			pageTitle: "Make QR code",
			templates: files,
			tablesQR: filesQR
		});

	} catch (err) {
		console.log(err);
	}
};

exports.postQR = (req, res, next) => {
	/* adding new category to db */
	const tableNumber = req.body.tableNumber;
	const templateTitle = req.body.radioCategory;

	const opts = {
		margin: 1,
		quality: 1,
		scale: 4,
		width: 256,
	  }

	//edit output of file and change render on site
	
	QRCode.toFile("public/menus/qr.png", req.headers.host.toString() + "/" + tableNumber.toString(), opts)
		.then(() => {
			PDFDocument.load(fs.readFileSync(`public/templates/${templateTitle}`)).then((pdfDoc) => {
				pdfDoc.embedPng(fs.readFileSync("public/menus/qr.png")).then((img) => {
					const imagePage = pdfDoc.getPages()[ 0 ];
					imagePage.drawImage(img, {
						x: 310,
						y: 250,
						width: 256,
						height: 256
					});
					
					pdfDoc.save().then(pdfBytes => {
						const newFilePath = `public/pdf/table-${tableNumber}-template-${templateTitle}.pdf`;
						fs.writeFileSync(newFilePath, pdfBytes);
					}).catch(err => console.log(err))
				}).catch(err => console.log(err))
			}).catch(err => console.log(err))
		})
		.catch((err) => {
			console.error(err);
		});	

	const dir = 'public/templates/';

	const dirTablesQR = 'public/pdf/';

	try {
		const files = fs.readdirSync(dir);
		const filesQR = fs.readdirSync(dirTablesQR);
		
		res.render("admin/make-qr", {
			path: "/make-qr",
			pageTitle: "Make QR code",
			templates: files,
			tablesQR: filesQR
		});

	} catch (err) {
		console.log(err);
	}
};

exports.postAddCategory = (req, res, next) => {
	/* adding new category to db */
	const title = req.body.title;
	const image = req.file;
	const url = req.body.url;
	const category = new Category({
		title: title,
		imageUrl: image.path.replace('public\\', "").replace('\\', "/"),
		url: url,
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
	/* adding new product to db and pushing it to an array in proper category in db*/
	const title = req.body.title;
	const price = req.body.price;
	const description = req.body.description;
	const image = req.file;
	if (!image) {
		return res.status(422).render("admin/edit-product")
	}
	const category = req.body.radioCategory;
	const userId = req.body.userId;
	const productId = req.body.Id;
	const product = new Product({
		title: title,
		price: price,
		description: description,
		imageUrl: image.path.replace('public\\', ""),
		category: category,
		userId: userId,
	});
	if (!productId) {
		product
			.save()
			.then((product) => {
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
		Product.findOneAndUpdate(
			{ _id: productId },
			{
				title: title,
				price: price,
				description: description,
				imageUrl: image,
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
					let productsUpdate = [...categoryObj.products];

					productsUpdate = productsUpdate.filter((obj) => {
						obj.productId !== product._id;
					});

					categoryObj.products = productsUpdate;
					categoryObj.save().catch((err) => console.log(err));
				})
				.catch((err) => console.log(err));
			res.redirect("/menu");
		})
		.catch((err) => console.log(err));
};
