import React, { useState } from 'react';
import './App.css';
import FitnessConsultForm from './components/FitnessConsultForm';
import ResponseDisplay from './components/ResponseDisplay';
import { getMockAdvice, getLLMAdvice } from './services/llmService';

interface ApiResponse {
  solution: string;
  loading: boolean;
  error: string | null;
}

function App() {
  const [response, setResponse] = useState<ApiResponse>({
    solution: '',
    loading: false,
    error: null
  });

  const handleSubmit = async (concern: string) => {
    setResponse({ solution: '', loading: true, error: null });
    
    try {
      // Use mock advice for development
      // Replace getMockAdvice with getLLMAdvice when you have real API
      const solution = await getMockAdvice(concern);
      // const solution = await getLLMAdvice(concern); // Use this for real API
      
      setResponse({ solution, loading: false, error: null });
    } catch (error) {
      setResponse({ 
        solution: '', 
        loading: false, 
        error: '상담 서비스에 연결할 수 없습니다. 잠시 후 다시 시도해주세요.' 
      });
    }
  };

  return (
    <div className="App">
      <header className="App-header">
        <h1>💪 AI 운동 상담사</h1>
        <p>운동에 대한 고민을 들려주세요</p>
      </header>
      
      <main className="App-main">
        <FitnessConsultForm onSubmit={handleSubmit} isLoading={response.loading} />
        <ResponseDisplay 
          solution={response.solution} 
          loading={response.loading} 
          error={response.error} 
        />
      </main>
      
      <footer className="App-footer">
        <p>© 2024 AI 운동 상담사. 건강한 삶을 위한 당신의 파트너</p>
      </footer>
    </div>
  );
}

export default App;
