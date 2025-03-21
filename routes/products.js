const express = require('express');
const { body, validationResult } = require('express-validator');
const { authenticateToken, restrictTo } = require('../middleware/auth');
const { createProduct, getAllProducts, getProductById, getProductsByFarmer } = require('../models/product');

const router = express.Router();

// Add Product
router.post(
    '/',
    authenticateToken,
    restrictTo('farmer'),
    [
      body('name').notEmpty(),
      body('price').isFloat({ min: 0 }),
      body('stock').isInt({ min: 0 }),
    ],
    async (req, res) => {
      const errors = validationResult(req);
      if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

      const { name, description, price, stock, image_url, category } = req.body;
      try {
        const product = await createProduct({
          farmer_id: req.user.id,
          name,
          description,
          price,
          stock,
          image_url,
          category,
        });
        res.status(201).json(product);
      } catch (err) {
        res.status(500).json({ error: 'Server error' });
      }
    }
);

// Get All Products
router.get('/', async (req, res) => {
  try {
    const products = await getAllProducts();
    res.json(products);
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

// Get Product by ID
router.get('/:id', async (req, res) => {
  try {
    const product = await getProductById(req.params.id);
    if (!product) return res.status(404).json({ error: 'Product not found' });
    res.json(product);
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

// Get Farmer's Products
router.get('/farmer/:farmer_id', authenticateToken, restrictTo('farmer'), async (req, res) => {
  if (req.user.id !== parseInt(req.params.farmer_id)) {
    return res.status(403).json({ error: 'Unauthorized' });
  }
  try {
    const products = await getProductsByFarmer(req.params.farmer_id);
    res.json(products);
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

// Edit Product
router.put(
    '/:id',
    authenticateToken,
    restrictTo('farmer'),
    [
      body('name').optional().notEmpty(),
      body('price').optional().isFloat({ min: 0 }),
      body('stock').optional().isInt({ min: 0 }),
    ],
    async (req, res) => {
      const errors = validationResult(req);
      if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

      const { id } = req.params;
      const { name, description, price, stock, image_url, category } = req.body;
      try {
        const product = await getProductById(id);
        if (!product) return res.status(404).json({ error: 'Product not found' });
        if (product.farmer_id !== req.user.id) return res.status(403).json({ error: 'Unauthorized' });

        const result = await pool.query(
            'UPDATE products SET name = COALESCE($1, name), description = COALESCE($2, description), price = COALESCE($3, price), stock = COALESCE($4, stock), image_url = COALESCE($5, image_url), category = COALESCE($6, category) WHERE id = $7 RETURNING *',
            [name, description, price, stock, image_url, category, id]
        );
        res.json(result.rows[0]);
      } catch (err) {
        res.status(500).json({ error: 'Server error' });
      }
    }
);

// Delete Product
router.delete('/:id', authenticateToken, restrictTo('farmer'), async (req, res) => {
  const { id } = req.params;
  try {
    const product = await getProductById(id);
    if (!product) return res.status(404).json({ error: 'Product not found' });
    if (product.farmer_id !== req.user.id) return res.status(403).json({ error: 'Unauthorized' });

    await pool.query('DELETE FROM products WHERE id = $1', [id]);
    res.status(204).send(); // No content
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;