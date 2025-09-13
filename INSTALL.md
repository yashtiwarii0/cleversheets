# CleverSheets Installation Guide

## Quick Start

For a quick setup, you can use our setup script which will install all dependencies for both frontend and backend:

```bash
node setup.js
```

After running the setup script, you can start the application with:

```bash
npm start
```

## Manual Installation

If you prefer to install manually, follow these steps:

### 1. Install Frontend Dependencies

In the root directory, run:

```bash
npm install
```

### 2. Install Backend Dependencies

Navigate to the server directory and install dependencies:

```bash
cd server
npm install
```

### 3. Start the Application

#### Option 1: Start Both Frontend and Backend Together

From the root directory:

```bash
npm start
```

#### Option 2: Start Frontend and Backend Separately

Start the backend server:

```bash
cd server
npm run dev
```

In a new terminal, start the frontend development server:

```bash
npm run dev
```

## Accessing the Application

Once both servers are running, you can access the application at:

- Frontend: http://localhost:5173
- Backend API: http://localhost:5000

## Troubleshooting

### Port Conflicts

If you encounter port conflicts, you can modify the port settings:

- For the frontend, edit the `vite.config.js` file
- For the backend, edit the `.env` file in the server directory

### Missing Dependencies

If you encounter errors about missing dependencies, try running:

```bash
npm install
```

And for the backend:

```bash
cd server
npm install
```

### File Upload Issues

If you encounter issues with file uploads, make sure the `uploads` directory exists in the server directory:

```bash
mkdir -p server/uploads
```