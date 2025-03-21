const pool = require('../config/database');

// Create a new product
const createProduct = async ({ farmer_id, name, description, price, stock, image_url, category }) => {
    const result = await pool.query(
        'INSERT INTO products (farmer_id, name, description, price, stock, image_url, category) VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *',
        [farmer_id, name, description, price, stock, image_url, category]
    );
    return result.rows[0];
};

// Get all products
const getAllProducts = async () => {
    const result = await pool.query('SELECT * FROM products ORDER BY created_at DESC');
    return result.rows;
};

// Get a product by ID
const getProductById = async (id) => {
    const result = await pool.query('SELECT * FROM products WHERE id = $1', [id]);
    return result.rows[0];
};

// Get products by farmer ID
const getProductsByFarmer = async (farmer_id) => {
    const result = await pool.query('SELECT * FROM products WHERE farmer_id = $1 ORDER BY created_at DESC', [farmer_id]);
    return result.rows;
};

// Update a product
const updateProduct = async (id, { name, description, price, stock, image_url, category }) => {
    const result = await pool.query(
        'UPDATE products SET name = COALESCE($1, name), description = COALESCE($2, description), price = COALESCE($3, price), stock = COALESCE($4, stock), image_url = COALESCE($5, image_url), category = COALESCE($6, category) WHERE id = $7 RETURNING *',
        [name, description, price, stock, image_url, category, id]
    );
    return result.rows[0];
};

// Delete a product
const deleteProduct = async (id) => {
    await pool.query('DELETE FROM products WHERE id = $1', [id]);
};

module.exports = { createProduct, getAllProducts, getProductById, getProductsByFarmer, updateProduct, deleteProduct };