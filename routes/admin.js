const express = require('express');
const { authenticateToken, restrictTo } = require('../middleware/auth');
const { approveFarmer, getUnverifiedFarmers } = require('../models/user');

const router = express.Router();

// Get list of unverified farmers
router.get('/farmers/unverified', authenticateToken, restrictTo('admin'), async (req, res) => {
    try {
        const farmers = await getUnverifiedFarmers();
        res.json(farmers);
    } catch (err) {
        res.status(500).json({ error: 'Server error' });
    }
});

// Approve a farmer
router.put('/approve-farmer/:farmer_id', authenticateToken, restrictTo('admin'), async (req, res) => {
    const { farmer_id } = req.params;
    try {
        const farmer = await approveFarmer(farmer_id);
        if (!farmer) return res.status(404).json({ error: 'Farmer not found or not a farmer' });
        res.json(farmer);
    } catch (err) {
        res.status(500).json({ error: 'Server error' });
    }
});

module.exports = router;