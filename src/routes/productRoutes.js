const express = require("express");
const productRepository = require("../repositories/productRepository");

const router = express.Router();

router.get("/", async (req, res, next) => {
  try {
    const products = await productRepository.getActiveProducts();
    res.json(products);
  } catch (error) {
    next(error);
  }
});

module.exports = router;


