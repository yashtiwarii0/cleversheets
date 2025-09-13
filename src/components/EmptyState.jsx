import React from 'react';

const EmptyState = () => {
  return (
    <div className="empty-state">
      <div className="empty-state-icon">❓</div>
      <h3>No Questions Generated Yet</h3>
      <p>Enter your notes or upload a file to generate exam questions</p>
    </div>
  );
};

export default EmptyState;