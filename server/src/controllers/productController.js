import { Product } from '../models/index.js';
import { ACCESS_LEVELS } from '../models/constants/accessLevels.js';

const MAX_PAGE_SIZE = 100;
const DEFAULT_PAGE_SIZE = 25;

// Helper function to generate HAL _link
const generateLinks = (req, resourceId = null, resourceCreatorId = null) => {
    const baseUrl = `${req.protocol}://${req.get('host')}/api/products`;
    const links = {
        self: {
            href: resourceId ? `${baseUrl}/${resourceId}` : baseUrl,
            method: 'GET',
        },
    };

    const user = req.user;
    const userAccesLevel = user?.accessLevel || 0;
    const isCreator = resourceCreatorId && user?._id?.toString() === resourceCreatorId.toString();

    if (resourceId) {
        // For individual resources
        const resourceUrl = `${baseUrl}/${resourceId}`;

        // Add update link if user is EDITOR (4+), or creator and REGULAR_USER (3+)
        if (userAccesLevel >= ACCESS_LEVELS.EDITOR || (isCreator && userAccesLevel >= ACCESS_LEVELS.REGULAR_USER)) {
            links.update = {
                href: resourceUrl,
                method: 'PUT',
            };
        }

        // Add delete link if user is MODERATOR (5+)
        if (userAccesLevel >= ACCESS_LEVELS.MODERATOR) {
            links.delete = {
                href: resourceUrl,
                method: 'DELETE',
            };
        }
    } else {
        // For collections, add create link if user is REGULAR_USER (3+)
        if (userAccesLevel >= ACCESS_LEVELS.REGULAR_USER) {
            links.create = {
                href: baseUrl,
                method: 'POST',
            };
        }
    }

    return { _links: links };
};

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

        // Generate pagination links
        const links = generateLinks(req);
        if (hasNextPage) {
            links._links.next = {
                href: `${links._links.self.href}?page=${page + 1}&limit=${limit}`,
                method: links._links.self.method,
            };
        }
        if (hasPreviousPage) {
            links._links.previous = {
                href: `${links._links.self.href}?page=${page - 1}&limit=${limit}`,
                method: links._links.self.method,
            };
        }

        // Add _links to each product
        const productsWithLinks = products.map((product) => ({
            ...product.toObject(),
            _links: generateLinks(req, product._id.toString())._links,
        }));

        // Return paginated response with HAL links
        res.json({
            _embedded: {
                products: productsWithLinks,
            },
            _links: links._links,
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
        res.status(500).json({ message: 'Server error', _links: generateLinks(req)._links });
    }
};

// Controller function to get a product by ID
export const getProductById = async (req, res) => {
    try {
        const product = await Product.findById(req.params.id).populate('creator', 'username');
        if (!product) {
            return res.status(404).json({ message: 'Product not found', _links: generateLinks(req)._links });
        }

        res.json({
            ...product.toObject(),
            _links: generateLinks(req, product._id.toString())._links,
        });
    } catch (error) {
        console.error('Get product error:', error);
        res.status(500).json({ message: 'Server error', _links: generateLinks(req, req.params.id)._links });
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
            ...product.toObject(),
            _links: generateLinks(req, product._id.toString())._links,
        });
    } catch (error) {
        console.error('Add product error:', error);
        res.status(500).json({ message: 'Server error', _links: generateLinks(req)._links });
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
        ).populate('creator', 'username');
        if (!product) {
            return res.status(404).json({ message: 'Product not found', _links: generateLinks(req)._links });
        }
        res.json({
            ...product.toObject(),
            _links: generateLinks(req, product._id.toString())._links,
        });
    } catch (error) {
        console.error('Update product error:', error);
        res.status(500).json({ message: 'Server error', _links: generateLinks(req, req.params.id)._links });
    }
};
