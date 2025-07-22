import React from 'react';
import './ResponseDisplay.css';

interface ResponseDisplayProps {
  solution: string;
  loading: boolean;
  error: string | null;
}

const ResponseDisplay: React.FC<ResponseDisplayProps> = ({ solution, loading, error }) => {
  if (loading) {
    return (
      <div className="response-container loading">
        <div className="loading-animation">
          <div className="pulse-circle"></div>
          <p>AI 상담사가 답변을 준비하고 있습니다...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="response-container error">
        <div className="error-icon">⚠️</div>
        <p>{error}</p>
      </div>
    );
  }

  if (!solution) {
    return null;
  }

  return (
    <div className="response-container success">
      <div className="response-header">
        <h2>🤖 AI 상담사의 답변</h2>
      </div>
      <div className="response-content">
        <pre>{solution}</pre>
      </div>
    </div>
  );
};

export default ResponseDisplay;