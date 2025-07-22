import axios from 'axios';

interface LLMResponse {
  solution: string;
}

// Example implementation for OpenAI API
// You'll need to replace this with your actual LLM provider
export const getLLMAdvice = async (concern: string): Promise<string> => {
  try {
    // Option 1: OpenAI API
    // const response = await axios.post(
    //   'https://api.openai.com/v1/chat/completions',
    //   {
    //     model: 'gpt-3.5-turbo',
    //     messages: [
    //       {
    //         role: 'system',
    //         content: '당신은 전문 운동 트레이너입니다. 사용자의 운동 고민에 대해 친절하고 구체적인 조언을 제공해주세요.'
    //       },
    //       {
    //         role: 'user',
    //         content: concern
    //       }
    //     ],
    //     temperature: 0.7,
    //     max_tokens: 1000
    //   },
    //   {
    //     headers: {
    //       'Authorization': `Bearer ${process.env.REACT_APP_OPENAI_API_KEY}`,
    //       'Content-Type': 'application/json'
    //     }
    //   }
    // );
    // return response.data.choices[0].message.content;

    // Option 2: Custom backend API
    const response = await axios.post<LLMResponse>(
      process.env.REACT_APP_API_URL || '/api/fitness-advice',
      { concern },
      {
        headers: {
          'Content-Type': 'application/json',
          // Add any authentication headers if needed
          // 'Authorization': `Bearer ${process.env.REACT_APP_API_KEY}`
        }
      }
    );
    
    return response.data.solution;
  } catch (error) {
    console.error('LLM API Error:', error);
    throw new Error('상담 서비스에 연결할 수 없습니다.');
  }
};

// Mock implementation for testing without real API
export const getMockAdvice = async (concern: string): Promise<string> => {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 2000));
  
  const mockResponses = [
    `안녕하세요! 운동 고민을 들려주셔서 감사합니다.

"${concern}"에 대한 제 조언은 다음과 같습니다:

1. **시작 단계**: 가벼운 유산소 운동부터 시작하세요
   - 하루 30분 걷기
   - 주 3회 이상 규칙적으로 실시

2. **근력 운동**: 기초 체력 향상을 위해
   - 스쿼트: 3세트 x 10회
   - 푸시업: 3세트 x 가능한 만큼
   - 플랭크: 3세트 x 30초

3. **식단 관리**: 운동과 함께 중요합니다
   - 단백질 섭취 늘리기
   - 충분한 수분 섭취
   - 가공식품 줄이기

4. **휴식의 중요성**: 
   - 주 1-2일은 반드시 휴식
   - 충분한 수면 (7-8시간)

꾸준함이 가장 중요합니다! 작은 목표부터 시작해서 점진적으로 늘려가세요. 화이팅! 💪`
  ];
  
  return mockResponses[0];
};