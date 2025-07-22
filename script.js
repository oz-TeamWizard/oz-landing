// ========================================
// mealStack - 맞춤형 단백질 계산기 
// ========================================

// 데이터 구조
// ========================================

// 목표별 단백질 계수
const proteinCoefficients = {
  bulkup: {
    recommended: 2.2,
    description: "근육량 증가를 위한 고단백 식단",
  },
  lean_bulkup: {
    recommended: 2.0,
    description: "체지방 증가 최소화하며 근육량 증가",
  },
  cutting: {
    recommended: 2.5,
    description: "근육량 보존하며 체지방 감소",
  },
  maintain: { 
    recommended: 1.8, 
    description: "현재 체형 유지" 
  },
};

// 활동량 배수
const activityMultipliers = {
  low: 1.0,
  moderate: 1.1,
  high: 1.2,
};

// 식사별 단백질 분배 비율
const mealDistribution = {
  아침: 0.25,
  점심: 0.3,
  저녁: 0.3,
  간식: 0.15,
};

// 목표별 식단 템플릿
const mealTemplates = {
  bulkup: {
    breakfast: {
      name: "고단백 아침식사",
      foods: [
        { name: "계란", amount: "3개", protein: 19.5 },
        { name: "귀리", amount: "60g", protein: 10.1 },
        { name: "우유", amount: "250ml", protein: 8.5 },
      ],
    },
    lunch: {
      name: "벌크업 점심",
      foods: [
        { name: "닭가슴살", amount: "200g", protein: 62.0 },
        { name: "현미", amount: "100g", protein: 7.9 },
        { name: "브로콜리", amount: "100g", protein: 2.8 },
      ],
    },
    dinner: {
      name: "벌크업 저녁",
      foods: [
        { name: "연어", amount: "180g", protein: 45.0 },
        { name: "고구마", amount: "150g", protein: 3.0 },
        { name: "시금치", amount: "100g", protein: 2.9 },
      ],
    },
    snack: {
      name: "벌크업 간식",
      foods: [
        { name: "웨이 프로틴", amount: "30g", protein: 24.0 },
        { name: "바나나", amount: "1개", protein: 1.1 },
      ],
    },
  },
  lean_bulkup: {
    breakfast: {
      name: "린벌크업 아침",
      foods: [
        { name: "계란흰자", amount: "4개", protein: 14.0 },
        { name: "오트밀", amount: "50g", protein: 8.5 },
      ],
    },
    lunch: {
      name: "린벌크업 점심",
      foods: [
        { name: "닭가슴살", amount: "180g", protein: 55.8 },
        { name: "현미", amount: "70g", protein: 5.5 },
        { name: "채소", amount: "150g", protein: 3.0 },
      ],
    },
    dinner: {
      name: "린벌크업 저녁",
      foods: [
        { name: "참치", amount: "150g", protein: 42.0 },
        { name: "고구마", amount: "100g", protein: 2.0 },
      ],
    },
    snack: {
      name: "린벌크업 간식",
      foods: [{ name: "웨이 프로틴", amount: "25g", protein: 20.0 }],
    },
  },
  cutting: {
    breakfast: {
      name: "컷팅 아침",
      foods: [
        { name: "계란흰자", amount: "5개", protein: 17.5 },
        { name: "시금치", amount: "100g", protein: 2.9 },
      ],
    },
    lunch: {
      name: "컷팅 점심",
      foods: [
        { name: "닭가슴살", amount: "200g", protein: 62.0 },
        { name: "샐러드", amount: "200g", protein: 4.0 },
      ],
    },
    dinner: {
      name: "컷팅 저녁",
      foods: [
        { name: "흰살생선", amount: "180g", protein: 40.0 },
        { name: "브로콜리", amount: "200g", protein: 5.6 },
      ],
    },
    snack: {
      name: "컷팅 간식",
      foods: [{ name: "카제인 프로틴", amount: "25g", protein: 19.5 }],
    },
  },
  maintain: {
    breakfast: {
      name: "유지 아침",
      foods: [
        { name: "계란", amount: "2개", protein: 13.0 },
        { name: "토스트", amount: "2장", protein: 6.0 },
      ],
    },
    lunch: {
      name: "유지 점심",
      foods: [
        { name: "닭가슴살", amount: "150g", protein: 46.5 },
        { name: "현미", amount: "80g", protein: 6.3 },
      ],
    },
    dinner: {
      name: "유지 저녁",
      foods: [
        { name: "두부", amount: "150g", protein: 12.0 },
        { name: "야채", amount: "150g", protein: 3.0 },
      ],
    },
    snack: {
      name: "유지 간식",
      foods: [{ name: "그릭요거트", amount: "150g", protein: 15.0 }],
    },
  },
};

// 고단백 식품 데이터
const proteinFoods = [
  { name: "닭가슴살", protein: 31.0, category: "육류" },
  { name: "참치", protein: 28.0, category: "해산물" },
  { name: "계란", protein: 13.0, category: "유제품" },
  { name: "웨이 프로틴", protein: 80.0, category: "보충제" },
  { name: "두부", protein: 8.0, category: "콩류" },
  { name: "그릭요거트", protein: 10.0, category: "유제품" },
  { name: "연어", protein: 25.0, category: "해산물" },
  { name: "소고기", protein: 26.0, category: "육류" },
];

// 메인 함수들
// ========================================

/**
 * 단백질량 계산 함수
 */
function calculateProtein() {
  const weight = parseFloat(document.getElementById("weight").value);
  const goal = document.getElementById("goal").value;
  const activity = document.getElementById("activity").value;

  // 입력값 검증
  if (!weight || !goal || !activity) {
    alert("모든 필드를 입력해주세요.");
    return;
  }

  if (weight < 40 || weight > 150) {
    alert("몸무게는 40kg~150kg 사이로 입력해주세요.");
    return;
  }

  // 로딩 표시
  document.getElementById("loading").style.display = "block";

  // 계산 시뮬레이션 (1.5초 딜레이)
  setTimeout(() => {
    const coefficient = proteinCoefficients[goal].recommended;
    const multiplier = activityMultipliers[activity];
    const totalProtein = Math.round(weight * coefficient * multiplier);

    // 로딩 숨기기
    document.getElementById("loading").style.display = "none";

    // 결과 표시
    displayResults(totalProtein, goal, weight);
  }, 1500);
}

/**
 * 결과 표시 함수
 * @param {number} totalProtein - 총 단백질량
 * @param {string} goal - 체형 목표
 * @param {number} weight - 몸무게
 */
function displayResults(totalProtein, goal, weight) {
  // 단백질량 표시
  document.getElementById("proteinAmount").textContent = totalProtein + "g";
  document.getElementById("goalDescription").textContent = 
    proteinCoefficients[goal].description;

  // 결과 섹션 표시 및 스크롤
  const resultSection = document.getElementById("resultSection");
  resultSection.style.display = "block";
  resultSection.scrollIntoView({ behavior: "smooth" });

  // 영양소 분배 표시
  displayNutritionBreakdown(totalProtein, weight, goal);

  // 식사별 단백질 배분 표시
  displayMealBreakdown(totalProtein);

  // 추천 식단 표시
  displayMealPlans(goal);

  // 고단백 식품 가이드 표시
  displayProteinChart();
}

/**
 * 영양소 분배 표시
 * @param {number} totalProtein - 총 단백질량
 * @param {number} weight - 몸무게
 * @param {string} goal - 체형 목표
 */
function displayNutritionBreakdown(totalProtein, weight, goal) {
  // 목표별 칼로리 계산
  const calorieMultipliers = {
    bulkup: 45,
    lean_bulkup: 40,
    cutting: 28,
    maintain: 35
  };
  
  const calories = Math.round(weight * calorieMultipliers[goal]);
  const carbs = Math.round((calories * 0.4) / 4); // 탄수화물 40%

  document.getElementById("nutritionBreakdown").innerHTML = `
    <div class="d-flex justify-content-between mb-2">
      <span>일일 칼로리</span>
      <span class="protein-badge">${calories}kcal</span>
    </div>
    <div class="d-flex justify-content-between mb-2">
      <span>단백질</span>
      <span class="protein-badge">${totalProtein}g</span>
    </div>
    <div class="d-flex justify-content-between">
      <span>탄수화물</span>
      <span class="protein-badge">${carbs}g</span>
    </div>
  `;
}

/**
 * 식사별 단백질 배분 표시
 * @param {number} totalProtein - 총 단백질량
 */
function displayMealBreakdown(totalProtein) {
  let mealBreakdownHtml = "";
  
  for (const [meal, ratio] of Object.entries(mealDistribution)) {
    const mealProtein = Math.round(totalProtein * ratio);
    mealBreakdownHtml += `
      <div class="d-flex justify-content-between mb-2">
        <span>${meal}</span>
        <span class="protein-badge">${mealProtein}g</span>
      </div>
    `;
  }
  
  document.getElementById("mealBreakdown").innerHTML = mealBreakdownHtml;
}

/**
 * 추천 식단 표시
 * @param {string} goal - 체형 목표
 */
function displayMealPlans(goal) {
  const mealPlansSection = document.getElementById("mealPlansSection");
  const mealPlans = document.getElementById("mealPlans");

  let html = '<div class="row">';
  const meals = mealTemplates[goal];
  
  for (const [mealType, mealData] of Object.entries(meals)) {
    const totalProtein = mealData.foods.reduce((sum, food) => sum + food.protein, 0);

    html += `
      <div class="col-md-6 mb-4">
        <div class="meal-card">
          <h5 class="meal-title">${mealData.name}</h5>
          <div class="mb-3">
    `;

    // 식품 목록 추가
    mealData.foods.forEach((food) => {
      html += `
        <div class="food-item">
          <span>${food.name} (${food.amount})</span>
          <span class="protein-badge">${food.protein}g</span>
        </div>
      `;
    });

    html += `
          </div>
          <div class="text-center">
            <strong>총 단백질: ${totalProtein.toFixed(1)}g</strong>
          </div>
        </div>
      </div>
    `;
  }

  html += "</div>";
  mealPlans.innerHTML = html;
  mealPlansSection.style.display = "block";
}

/**
 * 고단백 식품 가이드 표시
 */
function displayProteinChart() {
  const proteinChart = document.getElementById("proteinChart");
  const proteinChartSection = document.getElementById("proteinChartSection");

  let html = "";
  
  proteinFoods.forEach((food) => {
    html += `
      <div class="col-md-3 col-sm-6 mb-3">
        <div class="meal-card text-center">
          <h6 class="meal-title">${food.name}</h6>
          <div class="protein-amount" style="font-size: 1.5rem;">${food.protein}g</div>
          <small class="text-muted">100g당</small>
          <div class="mt-2">
            <span class="badge bg-secondary">${food.category}</span>
          </div>
        </div>
      </div>
    `;
  });

  proteinChart.innerHTML = html;
  proteinChartSection.style.display = "block";
}

/**
 * 언어 전환 함수
 */
function switchLanguage() {
  // 영어 버전으로 전환 (추후 구현)
  window.location.href = "#english-version";
  alert("영어 버전으로 전환합니다!");
}

// 이벤트 리스너 및 초기화
// ========================================

/**
 * DOM 로드 완료 시 실행
 */
document.addEventListener('DOMContentLoaded', function() {
  // 폼 제출 이벤트 리스너
  document.getElementById("proteinForm").addEventListener("submit", function (e) {
    e.preventDefault();
    calculateProtein();
  });

  // 부드러운 스크롤링 설정
  document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
    anchor.addEventListener("click", function (e) {
      e.preventDefault();
      const targetElement = document.querySelector(this.getAttribute("href"));
      if (targetElement) {
        targetElement.scrollIntoView({
          behavior: "smooth",
        });
      }
    });
  });

  // 입력값 실시간 검증
  const weightInput = document.getElementById("weight");
  if (weightInput) {
    weightInput.addEventListener('input', function() {
      const value = parseFloat(this.value);
      if (value && (value < 40 || value > 150)) {
        this.setCustomValidity('몸무게는 40kg~150kg 사이로 입력해주세요.');
      } else {
        this.setCustomValidity('');
      }
    });
  }
});

// 전역 함수로 노출 (HTML에서 호출할 수 있도록)
window.calculateProtein = calculateProtein;
window.switchLanguage = switchLanguage;