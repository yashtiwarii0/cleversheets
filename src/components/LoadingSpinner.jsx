import React from 'react';

const LoadingSpinner = () => {
  return (
    <div className="loading-spinner-container">
      <div className="loading-spinner"></div>
      <p>Processing your notes...</p>
    </div>
  );
};

export default LoadingSpinner;