# Packing Tracker

A simple full-stack web application to track belongings while packing for college.

## Features

- Clean, minimal, and mobile-friendly UI
- Add, edit, and delete belongings
- **Bulk add multiple items** at once with shared properties
- Search belongings by name
- Filter belongings by category or tag
- Mark items as packed/unpacked
- Progress tracking with visual indicators
- SQLite database for data persistence

## Tech Stack

- **Frontend**: React + TailwindCSS
- **Backend**: Node.js + Express
- **Database**: SQLite

## Project Structure

```
Packing-Tracker/
├── backend/          # Express server and API
├── frontend/         # React application
├── package.json      # Root package.json for running both apps
└── README.md
```

## Getting Started

### Quick Start (Recommended)
Run both frontend and backend together:

```bash
# Install dependencies for both frontend and backend
npm run install-all

# Start both frontend and backend simultaneously
npm run dev
```

The backend will run on http://localhost:3001 and the frontend on http://localhost:3000.

### Individual Commands

If you prefer to run them separately:

```bash
# Backend only
npm run server-only

# Frontend only  
npm run client-only

# Install backend dependencies
npm run install-server

# Install frontend dependencies
npm run install-client
```

### Manual Setup (Alternative)

#### Backend
```bash
cd backend
npm install
npm start
```

#### Frontend
```bash
cd frontend
npm install
npm start
```

## Available Scripts

- `npm run dev` - Run both frontend and backend in development mode
- `npm run start` - Same as dev (run both apps)
- `npm run server` - Run backend with nodemon (auto-restart)
- `npm run client` - Run frontend React app
- `npm run install-all` - Install dependencies for both apps
- `npm run build` - Build frontend for production

## New Features

### Bulk Add Items
- Click the "Bulk Add" button to add multiple items at once
- Set shared properties (category, tags, status) for all items
- Add items individually or paste a list (one item per line)
- Perfect for quickly adding many items from a packing list
