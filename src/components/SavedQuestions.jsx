import { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext';
import LoadingSpinner from './LoadingSpinner';

// Create axios instance with base URL
const api = axios.create({
  baseURL: 'http://localhost:5002',
  withCredentials: true
});

const SavedQuestions = () => {
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filter, setFilter] = useState('all'); // 'all', 'text', 'file'
  
  const { user } = useContext(AuthContext);

  useEffect(() => {
    const fetchQuestions = async () => {
      try {
        setLoading(true);
        let url = '/api/questions';
        
        if (filter !== 'all') {
          url = `/api/questions/source/${filter}`;
        }
        
        const res = await api.get(url);
        
        if (res.data.success) {
          setQuestions(res.data.data);
        }
      } catch (err) {
        setError('Failed to load your saved questions');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    if (user) {
      fetchQuestions();
    }
  }, [user, filter]);

  const handleDelete = async (id) => {
    try {
      const res = await api.delete(`/api/questions/${id}`);
      
      if (res.data.success) {
        setQuestions(questions.filter(q => q._id !== id));
      }
    } catch (err) {
      setError('Failed to delete question');
      console.error(err);
    }
  };

  if (loading) {
    return (
      <div className="loading-container">
        <LoadingSpinner />
        <p>Loading your saved questions...</p>
      </div>
    );
  }

  return (
    <div className="saved-questions-container">
      <div className="saved-questions-header">
        <h2>My Saved Questions</h2>
        
        <div className="filter-controls">
          <label htmlFor="filter">Filter by source:</label>
          <select 
            id="filter" 
            value={filter} 
            onChange={(e) => setFilter(e.target.value)}
            className="filter-select"
          >
            <option value="all">All Questions</option>
            <option value="text">Text Input</option>
            <option value="file">File Upload</option>
          </select>
        </div>
      </div>

      {error && <div className="error-message">{error}</div>}

      {questions.length === 0 ? (
        <div className="no-questions">
          <p>You don't have any saved questions yet.</p>
          <p>Generate questions from your notes to save them here!</p>
        </div>
      ) : (
        <div className="questions-grid">
          {questions.map((q) => (
            <div key={q._id} className={`question-card ${q.type}`}>
              <div className="question-card-header">
                <div className="question-type">{q.type}</div>
                <button 
                  onClick={() => handleDelete(q._id)} 
                  className="delete-button"
                  aria-label="Delete question"
                >
                  ×
                </button>
              </div>
              
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
              
              <div className="question-meta">
                <div className="source-info">
                  <span className="source-label">Source:</span> 
                  <span className="source-value">
                    {q.sourceType === 'text' ? 'Text Input' : 'File Upload'}
                    {q.sourceFileName && ` (${q.sourceFileName})`}
                  </span>
                </div>
                <div className="date-info">
                  {new Date(q.createdAt).toLocaleDateString()}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default SavedQuestions;