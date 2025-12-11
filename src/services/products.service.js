const productRepository = require('../repositories/product.repository');

const getAllProducts = async () => {
  // return await productRepository.getAllProducts();
};

const getProductById = async (id) => {
  // return await productRepository.getProductById(id);
};

module.exports = {
  getAllProducts,
  getProductById
};
