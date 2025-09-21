const express = require('express');
const router = express.Router();
const path = require('path');
const fs = require('fs');
const multer = require('multer');
const { body, validationResult } = require('express-validator');
const { requireAuth } = require('../middleware/auth');
const { addEvent, addPartner, getStatistics, getAllEvents, getAllPartners } = require('../utils/dataStorage');
const { count } = require('console');

// Create uploads directory if it doesn't exist
const uploadsDir = path.join(__dirname, '..', 'public', 'uploads', 'events');
if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir, { recursive: true });
}

// Configure multer for image uploads
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, uploadsDir);
    },
    filename: function (req, file, cb) {
        // Generate unique filename with timestamp
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, 'event-' + uniqueSuffix + path.extname(file.originalname));
    }
});

const fileFilter = (req, file, cb) => {
    // Check if file is an image
    if (file.mimetype.startsWith('image/')) {
        cb(null, true);
    } else {
        cb(new Error('يُسمح فقط بملفات الصور (JPG, PNG, GIF)'), false);
    }
};

const upload = multer({
    storage: storage,
    fileFilter: fileFilter,
    limits: {
        fileSize: 5 * 1024 * 1024, // 5MB limit per file
        files: 10 // Maximum 10 files
    }
});

// Apply authentication middleware to all dashboard routes
router.use(requireAuth);

// Dashboard main page
router.get('/', (req, res) => {
    res.sendFile(path.resolve(__dirname, '..', 'public', 'dashboard.html'));
});

// Add event page
router.get('/add-event', (req, res) => {
    res.sendFile(path.resolve(__dirname, '..', 'public', 'add-event.html'));
});

// Add partner page
router.get('/add-partner', (req, res) => {
    res.sendFile(path.resolve(__dirname, '..', 'public', 'add-partner.html'));
});

// Event detail page
router.get('/event/:id', (req, res) => {
    res.sendFile(path.resolve(__dirname, '..', 'public', 'event-detail.html'));
});

// API endpoint to get single event
router.get('/api/event/:id', (req, res) => {
    try {
        const events = getAllEvents();
        const event = events.find(e => e.id === req.params.id);
        
        if (!event) {
            return res.status(404).json({ error: 'Event not found' });
        }
        
        res.json(event);
    } catch (error) {
        console.error('Error fetching event:', error);
        res.status(500).json({ error: 'Failed to fetch event' });
    }
});

// API endpoint to get dashboard statistics
router.get('/api/stats', (req, res) => {
    try {
        const stats = getStatistics();
        res.json(stats);
    } catch (error) {
        console.error('Error fetching statistics:', error);
        res.status(500).json({ error: 'Failed to fetch statistics' });
    }
});

// API endpoint to get all events
router.get('/api/events', (req, res) => {
    try {
        const events = getAllEvents();
        res.json(events);
    } catch (error) {
        console.error('Error fetching events:', error);
        res.status(500).json({ error: 'Failed to fetch events' });
    }
});

// API endpoint to get all partners
router.get('/api/partners', (req, res) => {
    try {
        const partners = getAllPartners();
        res.json(partners);
    } catch (error) {
        console.error('Error fetching partners:', error);
        res.status(500).json({ error: 'Failed to fetch partners' });
    }
});

// Validation rules for adding events
const eventValidation = [
    body('title').trim().isLength({ min: 3, max: 200 }).withMessage('العنوان يجب أن يكون بين 3 و 200 حرف'),
    body('description').trim().isLength({ min: 10, max: 1000 }).withMessage('الوصف يجب أن يكون بين 10 و 1000 حرف'),
    body('date').isISO8601().withMessage('تاريخ غير صحيح'),
    body('people_helped').isInt({ min: 0 }).withMessage('عدد المستفيدين يجب أن يكون رقم موجب'),
    body('location').trim().isLength({ min: 2, max: 200 }).withMessage('الموقع يجب أن يكون بين 2 و 200 حرف'),
    body('budget').optional().isFloat({ min: 0 }).withMessage('الميزانية يجب أن تكون رقم موجب')
];

// Handle add event POST with image uploads
router.post('/add-event', upload.array('images', 10), eventValidation, (req, res) => {
    // const errors = validationResult(req);
    
    // if (!errors.isEmpty()) {
    //     // Clean up uploaded files if validation fails
    //     if (req.files) {
    //         req.files.forEach(file => {
    //             fs.unlink(file.path, (err) => {
    //                 if (err) console.error('Error deleting file:', err);
    //             });
    //         });
    //     }
    //     const errorMessages = errors.array().map(error => error.msg).join(', ');
    //     return res.redirect(`/dashboard/add-event?error=${encodeURIComponent(errorMessages)}`);
    // }

    const { title, description, date, people_helped, location, budget, partners } = req.body;
    
    try {
        // Process uploaded images
        const images = req.files ? req.files.map(file => ({
            filename: file.filename,
            originalname: file.originalname,
            path: `/uploads/events/${file.filename}`,
            size: file.size
        })) : [];

        const eventData = {
            title: title.trim(),
            description: description.trim(),
            date,
            images: images,
            people_helped: parseInt(people_helped) || 0,
            location: location.trim(),
            budget: parseFloat(budget) || 0,
            partners: partners || '',
            added_by: req.session.username
        };

        const newEvent = addEvent(eventData);
        
        if (newEvent) {
            res.redirect('/dashboard?success=event_added');
        } else {
            // Clean up uploaded files if save fails
            if (req.files) {
                req.files.forEach(file => {
                    fs.unlink(file.path, (err) => {
                        if (err) console.error('Error deleting file:', err);
                    });
                });
            }
            res.redirect('/dashboard/add-event?error=save_failed');
        }
    } catch (error) {
        console.error('Error adding event:', error);
        // Clean up uploaded files on error
        if (req.files) {
            req.files.forEach(file => {
                fs.unlink(file.path, (err) => {
                    if (err) console.error('Error deleting file:', err);
                });
            });
        }
        res.redirect('/dashboard/add-event?error=server_error');
    }
});

// Validation rules for adding partners
const partnerValidation = [
    body('name').trim().isLength({ min: 2, max: 200 }).withMessage('اسم الشريك يجب أن يكون بين 2 و 200 حرف'),
    body('type').trim().isLength({ min: 2, max: 100 }).withMessage('نوع الشريك يجب أن يكون بين 2 و 100 حرف'),
    body('description').trim().isLength({ min: 10, max: 500 }).withMessage('الوصف يجب أن يكون بين 10 و 500 حرف'),
    body('phone').optional().isMobilePhone('ar-SA').withMessage('رقم الهاتف غير صحيح'),
    body('email').optional().isEmail().withMessage('البريد الإلكتروني غير صحيح'),
    body('website').optional().isURL().withMessage('رابط الموقع غير صحيح')
];

// Handle add partner POST
router.post('/add-partner', partnerValidation, (req, res) => {
    // const errors = validationResult(req);
    
    // if (!errors.isEmpty()) {
    //     console.log("there is error")
    //     const errorMessages = errors.array().map(error => error.msg).join(', ');
    //     return res.redirect(`/dashboard/add-partner?error=${encodeURIComponent(errorMessages)}`);
    // }

    const {
        name,
        type,
        description,
        phone,
        email,
        website,
        location,
        services,
        contact_person,
        contact_position,
        notes
    } = req.body;
    
    try {
        const partnerData = {
            name: name.trim(),
            type: type.trim(),
            description: description.trim(),
            phone: phone || '',
            email: email || '',
            website: website || '',
            location: location || '',
            services: services || '',
            contact_person: contact_person || '',
            contact_position: contact_position || '',
            notes: notes || '',
            added_by: req.session.username
        };

        const newPartner = addPartner(partnerData);
        
        if (newPartner) {
            res.redirect('/dashboard?success=partner_added');
        } else {
            res.redirect('/dashboard/add-partner?error=save_failed');
        }
    } catch (error) {
        console.error('Error adding partner:', error);
        res.redirect('/dashboard/add-partner?error=server_error');
    }
});

module.exports = router;