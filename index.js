const express = require('express');
const mongoose = require('mongoose');

const productRoute = require('./routes/productRoute');
const inventoryRoute = require('./routes/inventoryRoute');

const app = express();
app.use(express.json());

const PORT = process.env.PORT || 3000;
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/castellano_db';

app.get('/', (req, res) => res.json({ message: 'API is running' }));

app.use('/api/products', productRoute);
app.use('/api/inventories', inventoryRoute);

mongoose
  .connect(MONGODB_URI)
  .then(() => {
    console.log('Connected to MongoDB');
    app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
  })
  .catch((err) => {
    console.error('MongoDB connection error:', err.message || err);
    process.exit(1);
  });

module.exports = app;
