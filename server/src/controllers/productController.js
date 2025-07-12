import { Product } from '../models/index.js';

const transformProduct = (product) => {
    // TODO: implement product transformation
    const transformedProduct = product;

    return transformedProduct;
};

// Controller function to get all products
export const getAllProducts = async (req, res) => {
    try {
        const products = await Product.find();
        const transformedProducts = products.map(transformProduct);
        res.json(transformedProducts);
    } catch (error) {
        console.error('Get products error:', error);
        res.status(500).send('Server error');
    }
};

// Controller function to get a product by ID
export const getProductById = async (req, res) => {
    try {
        const product = await Product.findById(req.params.id);
        const transformedProduct = transformProduct(product);
        res.json(transformedProduct);
    } catch (error) {
        console.error('Get product error:', error);
        res.status(500).send('Server error');
    }
};

export const createProduct = async (req, res) => {
    try {
        const { name, fat, protein, fiber, carbs } = req.body;
        const product = new Product({ name, fat, protein, fiber, carbs });
        await product.save();
        res.json(product);
    } catch (error) {
        console.error('Add product error:', error);
        res.status(500).send('Server error');
    }
};

export const updateProduct = async (req, res) => {
    try {
        const { id } = req.params;
        const { name, fat, protein, fiber, carbs } = req.body;
        const product = await Product.findById(id);
        product.name = name;
        product.fat = fat;
        product.protein = protein;
        product.fiber = fiber;
        product.carbs = carbs;
        await product.save();
        res.json(product);
    } catch (error) {
        console.error('Update product error:', error);
        res.status(500).send('Server error');
    }
};
