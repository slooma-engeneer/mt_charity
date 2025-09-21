const express = require('express');
const session = require('express-session');
const path = require('path');
const app = express();

// Session configuration
app.use(session({
    secret: 'charity-dashboard-secret-key-2024',
    resave: false,
    saveUninitialized: false,
    cookie: {
        secure: false, // Set to true in production with HTTPS
        maxAge: 24 * 60 * 60 * 1000 // 24 hours
    }
}));

app.use(express.static('public'));
app.use(express.json());
app.use(express.urlencoded({extended: true}));

// Import routers
const loginRouter = require('./routes/login');
const dashboardRouter = require('./routes/dashboard');
const { getAllEvents, getAllPartners, getEventById } = require('./utils/dataStorage');

// Use routers
app.use('/login', loginRouter);
app.use('/dashboard', dashboardRouter);

// Public API endpoints for events and partners (no authentication required)
app.get('/api/public/events', (req, res) => {
    try {
        const events = getAllEvents();
        res.json(events);
    } catch (error) {
        console.error('Error fetching public events:', error);
        res.status(500).json({ error: 'Failed to fetch events' });
    }
});

app.get('/api/public/partners', (req, res) => {
    try {
        const partners = getAllPartners();
        res.json(partners);
    } catch (error) {
        console.error('Error fetching public partners:', error);
        res.status(500).json({ error: 'Failed to fetch partners' });
    }
});

app.get('/api/public/event/:id', (req, res) => {
    try {
        const event = getEventById(req.params.id);
        if (!event) {
            return res.status(404).json({ error: 'Event not found' });
        }
        res.json(event);
    } catch (error) {
        console.error('Error fetching public event:', error);
        res.status(500).json({ error: 'Failed to fetch event' });
    }
});

// Main routes
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Public event detail page
app.get('/event/:id', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'event-detail.html'));
});

// 404 handler - يجب أن يكون في النهاية
app.use((req, res) => {
    res.status(404).sendFile(__dirname + '/public/404.html');
});

app.listen(3000, () => {
    console.log('🚀 الخادم يعمل على المنفذ 3000');
    console.log('🌐 افتح المتصفح على: http://localhost:3000');
});