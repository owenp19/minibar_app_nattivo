const productsService = require('../services/products.service');

const getAllProducts = async (req, res, next) => {
  try {
    // const products = await productsService.getAllProducts();
    // res.json(products);
    res.send('Get all products');
  } catch (error) {
    next(error);
  }
};

const getProductById = async (req, res, next) => {
  try {
    // const product = await productsService.getProductById(req.params.id);
    // res.json(product);
    res.send('Get product by id');
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getAllProducts,
  getProductById
};
