import { Product } from '../models/index.js';

const MAX_PAGE_SIZE = 100;
const DEFAULT_PAGE_SIZE = 25;

// Controller function to get all products
export const getAllProducts = async (req, res) => {
    try {
        // Parse query parameters with defaults
        const page = parseInt(req.query.page, 10) || 1;
        let limit = parseInt(req.query.limit, 10) || DEFAULT_PAGE_SIZE;
        const sortBy = req.query.sortBy || 'name';
        const sortOrder = req.query.sortOrder === 'desc' ? -1 : 1;

        // Validate and limit page size
        limit = Math.min(limit, MAX_PAGE_SIZE);
        limit = Math.max(limit, 1); // Ensure at least 1 item per page
        const skip = (page - 1) * limit;

        // Build sort object
        const sort = { [sortBy]: sortOrder };

        // Execute query with pagination
        const [products, total] = await Promise.all([
            Product.find().populate('creator', 'username').sort(sort).skip(skip).limit(limit),
            Product.countDocuments(),
        ]);

        // Calculate pagination metadata
        const totalPages = Math.ceil(total / limit);
        const hasNextPage = page < totalPages;
        const hasPreviousPage = page > 1;

        // Return paginated response
        res.json({
            _embedded: {
                products,
            },
            pagination: {
                currentPage: page,
                itemsPerPage: limit,
                totalItems: total,
                totalPages,
                hasNextPage,
                hasPreviousPage,
                nextPage: hasNextPage ? page + 1 : null,
                previousPage: hasPreviousPage ? page - 1 : null,
            },
        });
    } catch (error) {
        console.error('Get products error:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

// Controller function to get a product by ID
export const getProductById = async (req, res) => {
    try {
        const product = await Product.findById(req.params.id).populate('creator', 'username');
        if (!product) {
            return res.status(404).send('Product not found');
        }

        res.json({
            _embedded: {
                product,
            },
        });
    } catch (error) {
        console.error('Get product error:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

export const createProduct = async (req, res) => {
    try {
        const productData = {
            ...req.body,
            creator: req.user.userId,
        };
        const product = new Product(productData);
        await product.save();
        res.status(201).json({
            _embedded: {
                product,
            },
        });
    } catch (error) {
        console.error('Add product error:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

export const updateProduct = async (req, res) => {
    try {
        const { id } = req.params;
        const { name, fat, protein, fiber, carbs } = req.body;
        const product = await Product.findByIdAndUpdate(
            id,
            {
                $set: {
                    name: { $eg: name },
                    fat: { $eq: fat },
                    protein: { $eq: protein },
                    fiber: { $eq: fiber },
                    carbs: { $eq: carbs },
                },
            },
            { new: true, runValidators: true },
        );
        if (!product) {
            return res.status(404).send('Product not found');
        }
        res.json({
            _embedded: {
                product,
            },
        });
    } catch (error) {
        console.error('Update product error:', error);
        res.status(500).json({ message: 'Server error' });
    }
};
