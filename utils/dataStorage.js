const { error } = require('console');
const fs = require('fs');
const path = require('path');

// Helper function to read JSON file
function readJSONFile(filename) {
    try {
        const filePath = path.join(__dirname, '..', 'data', filename);
        const data = fs.readFileSync(filePath, 'utf8');
        return JSON.parse(data);
    } catch (error) {
        console.error(`Error reading ${filename}:`, error);
        return [];
    }
}

// Helper function to write JSON file
function writeJSONFile(filename, data) {
    try {
        const filePath = path.join(__dirname, '..', 'data', filename);
        fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf8');
        return true;
    } catch (error) {
        console.error(`Error writing ${filename}:`, error);
        return false;
    }
}

// Event management functions
function getAllEvents() {
    return readJSONFile('events.json');
}

function addEvent(eventData) {
    const events = getAllEvents();
    const newEvent = {
        id: Date.now().toString(),
        ...eventData,
        created_at: new Date().toISOString()
    };
    events.push(newEvent);
    return writeJSONFile('events.json', events) ? newEvent : null;
}

function getEventById(id) {
    const events = getAllEvents();
    return events.find(event => event.id === id);
}

function updateEvent(id, updateData) {
    const events = getAllEvents();
    const index = events.findIndex(event => event.id === id);
    if (index !== -1) {
        events[index] = { ...events[index], ...updateData, updated_at: new Date().toISOString() };
        return writeJSONFile('events.json', events) ? events[index] : null;
    }
    return null;
}

function deleteEvent(id) {
    const events = getAllEvents();
    const filteredEvents = events.filter(event => event.id !== id);
    return writeJSONFile('events.json', filteredEvents);
}

// Partner management functions
function getAllPartners() {
    return readJSONFile('partners.json')
}

function addPartner(partnerData) {
    try {
        const partners = getAllPartners();
        const newPartner = {
            id: Date.now().toString(),
            ...partnerData,
            created_at: new Date().toISOString()
        };
        partners.push(newPartner);
        const data = writeJSONFile('partners.json', partners) ? newPartner : null;
        return data
    } catch (e) {
        console.log("error")
        console.log(e)
    }
}

function getPartnerById(id) {
    const partners = getAllPartners();
    return partners.find(partner => partner.id === id);
}

function updatePartner(id, updateData) {
    const partners = getAllPartners();
    const index = partners.findIndex(partner => partner.id === id);
    if (index !== -1) {
        partners[index] = { ...partners[index], ...updateData, updated_at: new Date().toISOString() };
        return writeJSONFile('partners.json', partners) ? partners[index] : null;
    }
    return null;
}

function deletePartner(id) {
    const partners = getAllPartners();
    const filteredPartners = partners.filter(partner => partner.id !== id);
    return writeJSONFile('partners.json', filteredPartners);
}

// Statistics functions
function getStatistics() {
    const events = getAllEvents();
    const partners = getAllPartners();

    const totalEvents = events.length;
    const totalPartners = partners.length;
    const totalPeopleHelped = events.reduce((sum, event) => {
        return sum + (parseInt(event.people_helped) || 0);
    }, 0);

    return {
        totalEvents,
        totalPartners,
        totalPeopleHelped,
        recentEvents: events.slice(-5).reverse() // Last 5 events, newest first
    };
}

module.exports = {
    // Event functions
    getAllEvents,
    addEvent,
    getEventById,
    updateEvent,
    deleteEvent,

    // Partner functions
    getAllPartners,
    addPartner,
    getPartnerById,
    updatePartner,
    deletePartner,

    // Statistics
    getStatistics
};