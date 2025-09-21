const express = require('express');
const router = express.Router();
const path = require('path');
const { verifyCredentials } = require('../middleware/auth');

// Login page
router.get('/', (req, res) => {
    // If already authenticated, redirect to dashboard
    if (req.session && req.session.authenticated) {
        return res.redirect('/dashboard');
    }
    res.sendFile(path.resolve(__dirname, '..', 'public', 'login.html'));
});

// Handle login POST
router.post('/', async (req, res) => {
    const { username, password } = req.body;
    
    try {
        // Validate input
        if (!username || !password) {
            return res.redirect('/login?error=missing_fields');
        }

        // Verify credentials using the auth middleware
        const isValid = await verifyCredentials(username, password);
        
        if (isValid) {
            // Set session
            req.session.authenticated = true;
            req.session.username = username;
            req.session.loginTime = new Date();
            
            res.redirect('/dashboard');
        } else {
            res.redirect('/login?error=invalid_credentials');
        }
    } catch (error) {
        console.error('Login error:', error);
        res.redirect('/login?error=server_error');
    }
});

// Handle logout
router.post('/logout', (req, res) => {
    req.session.destroy((err) => {
        if (err) {
            console.error('Logout error:', err);
        }
        res.redirect('/login?message=logged_out');
    });
});

// Logout GET route for convenience
router.get('/logout', (req, res) => {
    req.session.destroy((err) => {
        if (err) {
            console.error('Logout error:', err);
        }
        res.redirect('/login?message=logged_out');
    });
});

module.exports = router;