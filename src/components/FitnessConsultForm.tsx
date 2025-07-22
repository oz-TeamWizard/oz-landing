import React, { useState } from 'react';
import './FitnessConsultForm.css';

interface FitnessConsultFormProps {
  onSubmit: (concern: string) => void;
  isLoading: boolean;
}

const FitnessConsultForm: React.FC<FitnessConsultFormProps> = ({ onSubmit, isLoading }) => {
  const [concern, setConcern] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (concern.trim()) {
      onSubmit(concern);
    }
  };

  return (
    <form className="fitness-form" onSubmit={handleSubmit}>
      <div className="form-group">
        <label htmlFor="concern" className="form-label">
          운동 고민을 자세히 설명해주세요
        </label>
        <textarea
          id="concern"
          className="form-textarea"
          rows={8}
          value={concern}
          onChange={(e) => setConcern(e.target.value)}
          placeholder="예: 다이어트를 하고 싶은데 어떤 운동부터 시작해야 할지 모르겠어요..."
          disabled={isLoading}
          required
        />
      </div>
      
      <button 
        type="submit" 
        className="submit-button" 
        disabled={isLoading || !concern.trim()}
      >
        {isLoading ? (
          <>
            <span className="loading-spinner"></span>
            분석 중...
          </>
        ) : (
          '상담 요청하기'
        )}
      </button>
    </form>
  );
};

export default FitnessConsultForm;