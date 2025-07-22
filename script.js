// OpenAI API 설정 (실제 사용 시 환경변수로 관리)
const API_KEY = 'YOUR_OPENAI_API_KEY'; // 실제 API 키로 교체 필요
const API_URL = 'https://api.openai.com/v1/chat/completions';

// DOM 요소
const form = document.getElementById('fitness-form');
const submitBtn = document.getElementById('submit-btn');
const resultSection = document.getElementById('result-section');
const resultContent = document.getElementById('result-content');
const resetBtn = document.getElementById('reset-btn');
const btnText = document.querySelector('.btn-text');
const loading = document.querySelector('.loading');

// BMI 계산 함수
function calculateBMI(height, weight) {
    const heightInMeters = height / 100;
    return (weight / (heightInMeters * heightInMeters)).toFixed(1);
}

// BMI 카테고리 분류
function getBMICategory(bmi) {
    if (bmi < 18.5) return '저체중';
    if (bmi < 23) return '정상체중';
    if (bmi < 25) return '과체중';
    return '비만';
}

// 기초대사율 계산 (Harris-Benedict 공식)
function calculateBMR(height, weight, age, gender) {
    if (gender === 'male') {
        return Math.round(88.362 + (13.397 * weight) + (4.799 * height) - (5.677 * age));
    } else {
        return Math.round(447.593 + (9.247 * weight) + (3.098 * height) - (4.330 * age));
    }
}

// 활동량에 따른 총 칼로리 필요량 계산
function calculateTDEE(bmr, activity) {
    const multipliers = {
        'low': 1.2,
        'moderate': 1.375,
        'high': 1.55,
        'very_high': 1.725
    };
    return Math.round(bmr * multipliers[activity]);
}

// AI 프롬프트 생성
function createPrompt(userData) {
    const { height, weight, age, gender, activity, goal } = userData;
    const bmi = calculateBMI(height, weight);
    const bmiCategory = getBMICategory(bmi);
    const bmr = calculateBMR(height, weight, age, gender);
    const tdee = calculateTDEE(bmr, activity);
    
    return `
당신은 전문 피트니스 트레이너이자 영양사입니다. 다음 사용자 정보를 바탕으로 맞춤형 운동식단을 추천해주세요.

**사용자 정보:**
- 키: ${height}cm
- 몸무게: ${weight}kg  
- 나이: ${age}세
- 성별: ${gender === 'male' ? '남성' : '여성'}
- 활동량: ${activity}
- 목표: ${goal}
- BMI: ${bmi} (${bmiCategory})
- 기초대사율(BMR): ${bmr} kcal/day
- 총 칼로리 필요량(TDEE): ${tdee} kcal/day

**요청사항:**
1. 목표에 맞는 일일 칼로리 섭취량 추천
2. 주요 영양소 비율 (탄수화물, 단백질, 지방)
3. 구체적인 식단 예시 (아침, 점심, 저녁, 간식)
4. 권장 운동 루틴 (주 3-4회)
5. 주의사항 및 팁

응답을 HTML 형식으로 구조화하여 제공해주세요. 제목은 <h3>, 내용은 <p>, 리스트는 <ul>/<li> 태그를 사용해주세요.
`;
}

// AI API 호출
async function getAIRecommendation(userData) {
    try {
        const response = await fetch(API_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${API_KEY}`
            },
            body: JSON.stringify({
                model: 'gpt-3.5-turbo',
                messages: [
                    {
                        role: 'system',
                        content: '당신은 전문 피트니스 트레이너이자 영양사입니다. 사용자의 신체 정보를 바탕으로 과학적이고 실용적인 운동식단을 추천해주세요.'
                    },
                    {
                        role: 'user',
                        content: createPrompt(userData)
                    }
                ],
                max_tokens: 2000,
                temperature: 0.7
            })
        });

        if (!response.ok) {
            throw new Error(`API 요청 실패: ${response.status}`);
        }

        const data = await response.json();
        return data.choices[0].message.content;
    } catch (error) {
        console.error('API 호출 오류:', error);
        
        // API 키가 없거나 오류 발생 시 샘플 응답 반환
        return getSampleResponse(userData);
    }
}

// 샘플 응답 (API 키가 없을 때 또는 데모용)
function getSampleResponse(userData) {
    const { height, weight, age, gender, goal } = userData;
    const bmi = calculateBMI(height, weight);
    const bmr = calculateBMR(height, weight, age, gender);
    const tdee = calculateTDEE(bmr, userData.activity);
    
    let targetCalories;
    let goalText;
    
    switch(goal) {
        case 'lose_weight':
            targetCalories = tdee - 500;
            goalText = '체중 감량';
            break;
        case 'gain_muscle':
            targetCalories = tdee + 300;
            goalText = '근육 증량';
            break;
        default:
            targetCalories = tdee;
            goalText = '체중 유지';
    }

    return `
<h3>🎯 개인 맞춤 분석</h3>
<p><strong>현재 BMI:</strong> ${bmi} (${getBMICategory(bmi)})</p>
<p><strong>기초대사율:</strong> ${bmr} kcal/day</p>
<p><strong>목표:</strong> ${goalText}</p>

<h3>🍽️ 일일 칼로리 및 영양소 추천</h3>
<ul>
    <li><strong>목표 칼로리:</strong> ${targetCalories} kcal/day</li>
    <li><strong>탄수화물:</strong> ${Math.round(targetCalories * 0.5 / 4)}g (50%)</li>
    <li><strong>단백질:</strong> ${Math.round(targetCalories * 0.25 / 4)}g (25%)</li>
    <li><strong>지방:</strong> ${Math.round(targetCalories * 0.25 / 9)}g (25%)</li>
</ul>

<h3>🥗 식단 예시</h3>
<p><strong>아침:</strong> 오트밀 + 바나나 + 견과류, 저지방 우유</p>
<p><strong>점심:</strong> 현미밥 + 닭가슴살 샐러드 + 올리브오일 드레싱</p>
<p><strong>저녁:</strong> 연어구이 + 브로콜리 + 고구마</p>
<p><strong>간식:</strong> 그릭요거트 + 베리류 또는 단백질 쉐이크</p>

<h3>💪 추천 운동 루틴</h3>
<ul>
    <li><strong>월, 수, 금:</strong> 근력운동 (상체, 하체 번갈아가며)</li>
    <li><strong>화, 목:</strong> 유산소운동 (30-45분)</li>
    <li><strong>주말:</strong> 활동적인 휴식 (산책, 요가 등)</li>
</ul>

<h3>⚠️ 주의사항 및 팁</h3>
<ul>
    <li>충분한 수분 섭취 (하루 2-3L)</li>
    <li>규칙적인 식사 시간 유지</li>
    <li>점진적인 변화를 통한 지속가능한 습관 형성</li>
    <li>운동 전후 적절한 영양 보충</li>
    <li>충분한 휴식과 수면 (7-8시간)</li>
</ul>

<p><small>※ 개인차가 있을 수 있으니, 전문가와 상담 후 실행하시기 바랍니다.</small></p>
`;
}

// 폼 제출 처리
form.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    // 로딩 상태 시작
    btnText.style.display = 'none';
    loading.style.display = 'inline-block';
    submitBtn.disabled = true;
    
    // 폼 데이터 수집
    const userData = {
        height: parseInt(document.getElementById('height').value),
        weight: parseInt(document.getElementById('weight').value),
        age: parseInt(document.getElementById('age').value),
        gender: document.getElementById('gender').value,
        activity: document.getElementById('activity').value,
        goal: document.getElementById('goal').value
    };
    
    try {
        // AI 추천 받기
        const recommendation = await getAIRecommendation(userData);
        
        // 결과 표시
        resultContent.innerHTML = recommendation;
        resultSection.style.display = 'block';
        
        // 결과 섹션으로 스크롤
        resultSection.scrollIntoView({ behavior: 'smooth' });
        
    } catch (error) {
        resultContent.innerHTML = `
            <div class="error-message">
                <h3>⚠️ 오류 발생</h3>
                <p>추천을 받는 중 오류가 발생했습니다. 잠시 후 다시 시도해주세요.</p>
                <p class="error-detail">${error.message}</p>
            </div>
        `;
        resultSection.style.display = 'block';
    } finally {
        // 로딩 상태 종료
        btnText.style.display = 'inline';
        loading.style.display = 'none';
        submitBtn.disabled = false;
    }
});

// 리셋 버튼 처리
resetBtn.addEventListener('click', () => {
    form.reset();
    resultSection.style.display = 'none';
    window.scrollTo({ top: 0, behavior: 'smooth' });
});

// API 키 확인 및 알림
document.addEventListener('DOMContentLoaded', () => {
    if (API_KEY === 'YOUR_OPENAI_API_KEY') {
        console.warn('⚠️ API 키가 설정되지 않았습니다. 샘플 응답을 사용합니다.');
        
        // 개발자용 알림 표시
        const notice = document.createElement('div');
        notice.style.cssText = `
            position: fixed;
            top: 10px;
            right: 10px;
            background: #ff9800;
            color: white;
            padding: 10px;
            border-radius: 5px;
            font-size: 12px;
            z-index: 1000;
            max-width: 300px;
        `;
        notice.innerHTML = '⚠️ 데모 모드: API 키를 설정하면 실제 AI 추천을 받을 수 있습니다.';
        document.body.appendChild(notice);
        
        // 5초 후 알림 제거
        setTimeout(() => notice.remove(), 5000);
    }
});