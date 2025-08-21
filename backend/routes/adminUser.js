const express = require('express');
const router = express.Router();

// Example admin user route
router.get('/users', (req, res) => {
	res.json({ message: 'Admin user route works!' });
});

module.exports = router;
