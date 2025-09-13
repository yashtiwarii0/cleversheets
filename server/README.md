# CleverSheets Backend Server

This is the backend server for CleverSheets, a web application that processes college notes and generates important exam questions.

## Features

- Text processing and analysis
- PDF file parsing
- Natural language processing to identify important concepts
- Question generation algorithms
- RESTful API endpoints

## Setup

1. Install dependencies:
   ```
   npm install
   ```

2. Create a `.env` file with the following variables:
   ```
   PORT=5000
   NODE_ENV=development
   ```

3. Start the development server:
   ```
   npm run dev
   ```

## API Endpoints

### Process Text

- **URL**: `/api/process-text`
- **Method**: POST
- **Body**: `{ "text": "Your notes content here..." }`
- **Response**: `{ "questions": [...] }`

### Upload File

- **URL**: `/api/upload`
- **Method**: POST
- **Body**: FormData with a file field named 'file'
- **Response**: `{ "questions": [...] }`

## Technologies Used

- Node.js
- Express
- Natural (NLP library)
- pdf-parse (PDF processing)
- multer (File uploads)