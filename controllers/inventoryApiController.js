const mongoose = require('mongoose');
const Inventory = require('../schemas/inventory');

const parseStockPayload = (body) => {
    const { product, quantity } = body;

    if (!mongoose.Types.ObjectId.isValid(product)) {
        return { error: 'Invalid product id' };
    }

    if (typeof quantity !== 'number' || quantity <= 0) {
        return { error: 'Quantity must be a number greater than 0' };
    }

    return { product, quantity };
};

// GET: Lấy tất cả inventory (join với product)
exports.getAllInventories = async (req, res) => {
    try {
        const inventories = await Inventory.find().populate('product', 'name price');
        res.status(200).json(inventories);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// GET: Lấy inventory theo ID (join với product)
exports.getInventoryById = async (req, res) => {
    try {
        const inventory = await Inventory.findById(req.params.id).populate('product', 'name price');
        if (!inventory) return res.status(404).json({ message: 'Inventory not found' });
        res.status(200).json(inventory);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// POST: Thêm stock
exports.addStock = async (req, res) => {
    try {
        const payload = parseStockPayload(req.body);
        if (payload.error) return res.status(400).json({ message: payload.error });

        const { product, quantity } = payload;

        const inventory = await Inventory.findOneAndUpdate(
            { product: product },
            { $inc: { stock: quantity } },
            { new: true }
        );

        if (!inventory) return res.status(404).json({ message: 'Inventory not found for this product' });
        res.status(200).json({ message: 'Stock added', inventory });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// POST: Giảm stock
exports.removeStock = async (req, res) => {
    try {
        const payload = parseStockPayload(req.body);
        if (payload.error) return res.status(400).json({ message: payload.error });

        const { product, quantity } = payload;

        // Điều kiện stock: { $gte: quantity } đảm bảo không bị âm kho
        const inventory = await Inventory.findOneAndUpdate(
            { product: product, stock: { $gte: quantity } },
            { $inc: { stock: -quantity } },
            { new: true }
        );

        if (!inventory) return res.status(400).json({ message: 'Insufficient stock or inventory not found' });
        res.status(200).json({ message: 'Stock removed', inventory });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// POST: Reservation (Giảm stock, tăng reserved)
exports.reservation = async (req, res) => {
    try {
        const payload = parseStockPayload(req.body);
        if (payload.error) return res.status(400).json({ message: payload.error });

        const { product, quantity } = payload;

        const inventory = await Inventory.findOneAndUpdate(
            { product: product, stock: { $gte: quantity } },
            { $inc: { stock: -quantity, reserved: quantity } },
            { new: true }
        );

        if (!inventory) return res.status(400).json({ message: 'Insufficient stock to reserve' });
        res.status(200).json({ message: 'Stock reserved successfully', inventory });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// POST: Sold (Giảm reserved, tăng soldCount)
exports.sold = async (req, res) => {
    try {
        const payload = parseStockPayload(req.body);
        if (payload.error) return res.status(400).json({ message: payload.error });

        const { product, quantity } = payload;

        const inventory = await Inventory.findOneAndUpdate(
            { product: product, reserved: { $gte: quantity } },
            { $inc: { reserved: -quantity, soldCount: quantity } },
            { new: true }
        );

        if (!inventory) return res.status(400).json({ message: 'Insufficient reserved stock' });
        res.status(200).json({ message: 'Items sold successfully', inventory });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};