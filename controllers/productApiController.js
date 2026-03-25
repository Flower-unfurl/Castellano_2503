const Product = require('../schemas/product');
const Inventory = require('../schemas/inventory');

const validateProductPayload = (body) => {
    const { name, price } = body;

    if (!name || typeof name !== 'string' || !name.trim()) {
        return 'Name is required';
    }

    if (typeof price !== 'number' || price < 0) {
        return 'Price must be a number greater than or equal to 0';
    }

    return null;
};

exports.createProduct = async (req, res) => {
    try {
        const validationError = validateProductPayload(req.body);
        if (validationError) {
            return res.status(400).json({ message: validationError });
        }

        // 1. Tạo Product mới
        const newProduct = await Product.create(req.body);

        // 2. Tạo Inventory tương ứng với số lượng mặc định (0)
        await Inventory.create({
            product: newProduct._id
        });

        res.status(201).json({
            message: 'Product and Inventory created successfully',
            product: newProduct
        });
    } catch (error) {
        if (error.code === 11000) {
            return res.status(409).json({ message: 'Inventory for this product already exists' });
        }

        res.status(500).json({ error: error.message });
    }
};