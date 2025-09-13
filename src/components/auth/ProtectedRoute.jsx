import { useContext } from 'react';
import { Navigate } from 'react-router-dom';
import AuthContext from '../../context/AuthContext';
import LoadingSpinner from '../LoadingSpinner';

const ProtectedRoute = ({ children }) => {
  const { user, loading } = useContext(AuthContext);

  if (loading) {
    return (
      <div className="loading-container">
        <LoadingSpinner />
        <p>Loading...</p>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" />;
  }

  return children;
};

export default ProtectedRoute;