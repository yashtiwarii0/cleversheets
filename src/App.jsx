import { useState, useRef, useContext } from 'react'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import './App.css'
import logo from './assets/logo.svg'
import LoadingSpinner from './components/LoadingSpinner'
import EmptyState from './components/EmptyState'
import Navbar from './components/Navbar'
import Login from './components/auth/Login'
import Register from './components/auth/Register'
import ProtectedRoute from './components/auth/ProtectedRoute'
import SavedQuestions from './components/SavedQuestions'
import { AuthProvider, AuthContext } from './context/AuthContext'
import axios from 'axios'

// Create axios instance with base URL
const api = axios.create({
  baseURL: 'http://localhost:5002',
  withCredentials: true
})

function Home() {
  const [notes, setNotes] = useState('');
  const [file, setFile] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState('text'); // 'text' or 'file'
  const fileInputRef = useRef(null);
  const { user } = useContext(AuthContext);

  const handleTextSubmit = async (e) => {
    e.preventDefault();
    if (!notes.trim()) {
      setError('Please enter your notes');
      return;
    }

    setLoading(true);
    setError('');
    
    try {
      const response = await api.post('/api/process-text', { text: notes });
      setQuestions(response.data.questions);
      
      // If user is logged in, save questions to database
      if (user) {
        try {
          await api.post('/api/questions/batch', { 
            questions: response.data.questions 
          });
          console.log('Questions saved to database');
        } catch (saveError) {
          console.error('Error saving questions:', saveError);
        }
      }
      
      // Note: Questions are already saved in the previous block if user is logged in
    } catch (err) {
      setError(err.message || 'An error occurred while processing your notes');
    } finally {
      setLoading(false);
    }
  };

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile) {
      setFile(selectedFile);
      setError('');
    }
  };

  const handleFileSubmit = async (e) => {
    e.preventDefault();
    if (!file) {
      setError('Please select a file');
      return;
    }

    setLoading(true);
    setError('');

    const formData = new FormData();
    formData.append('file', file);

    try {
      const response = await api.post('/api/upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });

      setQuestions(response.data.questions);
      
      // Save questions if user is logged in
      if (user && response.data.questions.length > 0) {
        try {
          await api.post('/api/questions/batch', {
            questions: response.data.questions,
            sourceText: 'File upload',
            sourceType: 'file',
            sourceFileName: file.name
          });
          console.log('Questions saved to database');
        } catch (saveErr) {
          console.error('Failed to save questions:', saveErr);
          // Don't show error to user, as questions were still generated successfully
        }
      }
    } catch (err) {
      setError(err.message || 'An error occurred while processing your file');
    } finally {
      setLoading(false);
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
  };

  const handleDrop = (e) => {
    e.preventDefault();
    const droppedFile = e.dataTransfer.files[0];
    if (droppedFile) {
      setFile(droppedFile);
      setError('');
    }
  };

  const resetForm = () => {
    setNotes('');
    setFile(null);
    setQuestions([]);
    setError('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className="home-container">
      <div className="welcome-message">
        <h2>Transform Your Notes into Exam Questions</h2>
        <p>Enter your study notes or upload a file to generate practice questions</p>
        {user && <p className="user-welcome">Welcome back, {user.username}! Your questions will be saved automatically.</p>}  
      </div>

      <main className="app-main">
        <div className="input-section">
          <div className="tabs">
            <button 
              className={`tab ${activeTab === 'text' ? 'active' : ''}`}
              onClick={() => setActiveTab('text')}
            >
              Enter Text
            </button>
            <button 
              className={`tab ${activeTab === 'file' ? 'active' : ''}`}
              onClick={() => setActiveTab('file')}
            >
              Upload File
            </button>
          </div>

          {activeTab === 'text' ? (
            <form onSubmit={handleTextSubmit} className="text-form">
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Paste your notes here..."
                rows="10"
                required
              />
              {loading ? (
                <LoadingSpinner />
              ) : (
                <button type="submit" disabled={loading}>
                  Generate Questions
                </button>
              )}
            </form>
          ) : (
            <form onSubmit={handleFileSubmit} className="file-form">
              <div 
                className="drop-area"
                onDragOver={handleDragOver}
                onDrop={handleDrop}
              >
                <p>Drag & drop your file here or</p>
                <input
                  type="file"
                  onChange={handleFileChange}
                  accept=".txt,.pdf,.doc,.docx"
                  ref={fileInputRef}
                />
                {file && <p className="file-name">Selected: {file.name}</p>}
              </div>
              {loading ? (
                <LoadingSpinner />
              ) : (
                <button type="submit" disabled={loading}>
                  Generate Questions
                </button>
              )}
            </form>
          )}

          {error && <div className="error-message">{error}</div>}
           
           {!loading && !error && questions.length === 0 && <EmptyState />}
         </div>

         {questions.length > 0 && (
          <div className="results-section">
            <div className="results-header">
              <h2>Generated Questions</h2>
              <button onClick={resetForm} className="reset-button">
                Start Over
              </button>
            </div>
            <div className="questions-list">
              {questions.map((q, index) => (
                <div key={index} className={`question-card ${q.type}`}>
                  <div className="question-type">{q.type}</div>
                  <div className="question-text">{q.question}</div>
                  {q.answer && (
                    <div className="question-answer">
                      <strong>Answer:</strong> {q.answer}
                    </div>
                  )}
                  {q.originalSentence && (
                    <div className="question-context">
                      <strong>Context:</strong> {q.originalSentence}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </main>
    </div>
  )
}

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="app-container">
          <Navbar />
          <main className="app-main-content">
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route 
                path="/my-questions" 
                element={
                  <ProtectedRoute>
                    <SavedQuestions />
                  </ProtectedRoute>
                } 
              />
            </Routes>
          </main>
        </div>
      </Router>
    </AuthProvider>
  )
}

export default App
