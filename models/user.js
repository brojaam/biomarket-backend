const pool = require('../config/database');
const bcrypt = require('bcrypt');

const createUser = async ({ email, password, name, phone, address, role, farm_name, location }) => {
    const hashedPassword = await bcrypt.hash(password, 10);
    const result = await pool.query(
        'INSERT INTO users (email, password, name, phone, address, role, farm_name, location) VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING id, email, name, role, verified',
        [email, hashedPassword, name, phone, address, role, farm_name, location]
    );
    return result.rows[0];
};

const findUserByEmail = async (email) => {
    const result = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
    return result.rows[0];
};

const approveFarmer = async (farmerId) => {
    const result = await pool.query(
        'UPDATE users SET verified = TRUE WHERE id = $1 AND role = $2 RETURNING id, email, name, role, verified',
        [farmerId, 'farmer']
    );
    return result.rows[0];
};

const getUnverifiedFarmers = async () => {
    const result = await pool.query('SELECT id, email, name, farm_name, location FROM users WHERE role = $1 AND verified = FALSE', ['farmer']);
    return result.rows;
};

module.exports = { createUser, findUserByEmail, approveFarmer, getUnverifiedFarmers };