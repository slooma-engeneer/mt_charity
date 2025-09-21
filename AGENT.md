# Charity Dashboard - Agent Guide

## Commands
- **Start dev server**: `npm run dev` (with auto-reload) or `npm start` (production)
- **Install dependencies**: `npm install`
- **No tests configured** - consider adding Jest or Mocha for testing

## Architecture
- **Type**: Node.js Express web application for charity dashboard
- **Main entry**: server.js (port 3000)
- **Routes**: `/routes/login.js` (auth), `/routes/dashboard.js` (main dashboard)
- **Static files**: `/public/` (HTML, CSS, JS, images)
- **Data**: Currently no database - logs to console, has `/data/login.json`
- **Authentication**: Simple hardcoded credentials (admin/charity123)

## Structure
- `server.js` - Main Express app with static middleware and routing
- `routes/` - Modular Express routers for login and dashboard functionality  
- `public/` - Frontend assets (HTML pages, CSS, JavaScript)
- `middleware/` - Contains empty `auth.js` (authentication middleware placeholder)

## Code Style
- **Language**: JavaScript (Node.js), Arabic RTL frontend
- **Framework**: Express.js with basic routing
- **File naming**: kebab-case for HTML files, camelCase for JS
- **Routing**: Uses Express Router pattern with path.resolve for file serving
- **Error handling**: Basic 404 handler, no comprehensive error middleware
- **Comments**: Minimal, mostly in Arabic for frontend-facing content
