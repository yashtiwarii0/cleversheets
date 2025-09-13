# CleverSheets

CleverSheets is a web application that transforms college notes into exam questions using natural language processing. It helps students prepare for exams by identifying key concepts in their notes and generating relevant questions.

## Features

- **Text Input**: Paste your notes directly into the application
- **File Upload**: Upload TXT, PDF, or DOC files containing your notes
- **Question Generation**: Automatically generates fill-in-the-blank and short answer questions
- **Responsive Design**: Works on desktop and mobile devices

## Tech Stack

### Frontend
- React
- Vite
- CSS3

### Backend
- Node.js
- Express
- Natural (NLP library)
- PDF-Parse (for PDF processing)

## Setup Instructions

### Prerequisites
- Node.js (v14 or higher)
- npm (v6 or higher)

### Installation

1. Clone the repository

2. Install frontend dependencies:
   ```
   npm install
   ```

3. Install backend dependencies:
   ```
   cd server
   npm install
   ```

### Running the Application

1. Start the backend server:
   ```
   cd server
   npm run dev
   ```

2. In a new terminal, start the frontend development server:
   ```
   npm run dev
   ```

3. Open your browser and navigate to `http://localhost:5173`

## Usage

1. Choose between entering text directly or uploading a file
2. If entering text, paste your notes into the text area and click "Generate Questions"
3. If uploading a file, select a TXT, PDF, or DOC file and click "Generate Questions"
4. View the generated questions in the results section
5. Use the "Start Over" button to reset and try with different notes

## License

MIT
