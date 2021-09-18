const express = require("express");

const notFoundController = require("../controllers/notfound")

const router = express.Router();

router.use(notFoundController.notFound);


module.exports = router;