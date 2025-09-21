const fs = require('fs');
const path = require('path');

// Load user credentials from JSON file
function loadCredentials() {
    try {
        const credentialsPath = path.join(__dirname, '..', 'data', 'login.json');
        const data = fs.readFileSync(credentialsPath, 'utf8');
        return JSON.parse(data);
    } catch (error) {
        console.error('Error loading credentials:', error);
        return null;
    }
}

// Authentication middleware
function requireAuth(req, res, next) {
    if (req.session && req.session.authenticated) {
        return next();
    } else {
        return res.redirect('/login?error=unauthorized');
    }
}

// Verify login credentials
async function verifyCredentials(username, password) {
    const credentials = loadCredentials();
    if (!credentials) {
        return false;
    }

    if (username === credentials.username) {
        // For now, compare plain text passwords
        // In production, you should hash passwords
        return password === credentials.password;
    }
    
    return false;
}

// Hash password (for future use)
async function hashPassword(password) {
    const saltRounds = 10;
    return await bcrypt.hash(password, saltRounds);
}

// Compare password with hash (for future use)
async function comparePassword(password, hash) {
    return await bcrypt.compare(password, hash);
}

module.exports = {
    requireAuth,
    verifyCredentials,
    loadCredentials
};