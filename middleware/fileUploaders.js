const multer = require("multer");

const {
	fileStorageProductImg,
    fileStorageCategoryImg,
	fileFilterImg,
	fileStoragePdf,
    fileFilterPdf,
} = require("../util/multerSettings");

exports.productImage = (req, res, next) => {
    multer({ storage: fileStorageProductImg, fileFilter: fileFilterImg }).single(
		"image"
	)(req, res, function (err) {
		if (err instanceof multer.MulterError) {
			console.log(err)
		} else if (err) {
			console.log(err)
		}
        next()
    });
}

exports.categoryImage = (req, res, next) => {
    multer({ storage: fileStorageCategoryImg, fileFilter: fileFilterImg }).single(
		"categoryImage"
	)(req, res, function (err) {
		if (err instanceof multer.MulterError) {
			console.log(err)
		} else if (err) {
			console.log(err)
		}
        next()
    });
}
 
 
exports.templatePdf = (req, res, next) => {
	multer({ storage: fileStoragePdf, fileFilter: fileFilterPdf }).single("pdf")
		(req, res, function (err) {
		if (err instanceof multer.MulterError) {
			console.log(err)
		} else if (err) {
			console.log(err)
		}
        next()
    });
 }
