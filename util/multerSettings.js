const multer = require("multer");


exports.fileStorageProductImg = multer.diskStorage({
	destination: (req, file, cb) => {
		cb(null, "public/images/product");
	},
	filename: (req, file, cb) => {
		cb(null, new Date().getDate() + "-" + file.originalname);
	},
});

exports.fileStorageCategoryImg = multer.diskStorage({
	destination: (req, file, cb) => {
		cb(null, "public/images/");
	},
	filename: (req, file, cb) => {
		cb(null, new Date().getDate() + "-" + file.originalname);
	},
});

exports.fileStoragePdf = multer.diskStorage({
	destination: (req, file, cb) => {
		console.log(file)
		cb(null, "public/templates/");
	},
	filename: (req, file, cb) => {
		cb(null, new Date().toISOString() + "-" + file.originalname);
	},
});

exports.fileFilterImg = (req, file, cb) => {
	if (
		file.mimetype === "image/png" ||
		file.mimetype === "image/jpg" ||
		file.mimetype === "image/jpeg" ||
		file.mimetype === "image/JPG"
	) {
		cb(null, true);
	} else {
		cb(null, false);
	}
};

exports.fileFilterPdf = (req, file, cb) => {
	if (
		file.mimetype === "file/pdf"
	) {
		cb(null, true);
	} else {
		cb(null, false);
	}
};
