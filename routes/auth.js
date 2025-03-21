const express = require('express');
const { body, validationResult } = require('express-validator');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { createUser, findUserByEmail } = require('../models/user');

const router = express.Router();

router.post(
    '/register',
    [
        body('email').isEmail().normalizeEmail(),
        body('password').isLength({ min: 6 }),
        body('name').notEmpty(),
        body('role').isIn(['user', 'farmer', 'admin']),
    ],
    async (req, res) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

        const { email, password, name, phone, address, role, farm_name, location } = req.body;
        try {
            const existingUser = await findUserByEmail(email);
            if (existingUser) return res.status(400).json({ error: 'Email already in use' });

            const user = await createUser({ email, password, name, phone, address, role, farm_name, location });
            res.status(201).json(user);
        } catch (err) {
            res.status(500).json({ error: 'Server error' });
        }
    }
);

// Login (unchanged)
router.post(
    '/login',
    [body('email').isEmail().normalizeEmail(), body('password').notEmpty()],
    async (req, res) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

        const { email, password } = req.body;
        try {
            const user = await findUserByEmail(email);
            if (!user || !(await bcrypt.compare(password, user.password))) {
                return res.status(401).json({ error: 'Invalid credentials' });
            }
            const token = jwt.sign({ id: user.id, role: user.role, verified: user.verified }, process.env.JWT_SECRET, { expiresIn: '1h' });
            res.json({ token, user: { id: user.id, email: user.email, name: user.name, role: user.role, verified: user.verified } });
        } catch (err) {
            res.status(500).json({ error: 'Server error' });
        }
    }
);

module.exports = router;