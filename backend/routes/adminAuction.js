const express = require('express');
const router = express.Router();

// Example admin auction route
router.get('/auctions', (req, res) => {
	res.json({ message: 'Admin auction route works!' });
});

module.exports = router;
