/**
 * 공통 유틸리티 함수 모음
 */

// DOM 요소 단축 함수
const $ = (id) => document.getElementById(id);
const $$ = (selector) => document.querySelectorAll(selector);

// 로딩 상태 관리
const showLoading = () => {
  $('loading').style.display = 'block';
  ['resultSectionWrapper', 'mealPlansSection', 'mainProteinCard', 'captureSection']
    .forEach(id => $(id).style.display = 'none');
};

const hideLoading = () => {
  $('loading').style.display = 'none';
};

// 영양소별 주영양소 분류
function getPrimaryNutrient(foodName) {
  const proteinFoods = [
    "닭가슴살", "소고기", "돼지고기", "연어", "참치", "흰살생선",
    "계란", "계란흰자", "웨이 프로틴", "카제인 프로틴", "두부", "그릭요거트"
  ];
  const carbFoods = [
    "현미밥", "통밀빵", "고구마", "바나나", "사과", "오트밀", "퀴노아", "베리류"
  ];
  const fatFoods = ["견과류", "아몬드", "아보카도", "올리브오일"];
  
  if (proteinFoods.includes(foodName)) return "protein";
  if (carbFoods.includes(foodName)) return "carb";
  if (fatFoods.includes(foodName)) return "fat";
  return "protein";
}

// BMR 계산 (Harris-Benedict 공식)
function calculateBMR(weight, height, age, gender) {
  let bmr = 0;
  if (gender === 'male') {
    bmr = 88.362 + (13.397 * weight) + (4.799 * height) - (5.677 * age);
  } else if (gender === 'female') {
    bmr = 447.593 + (9.247 * weight) + (3.098 * height) - (4.330 * age);
  }
  return bmr;
}

// 칼로리 계산
function calculateCalories(weight, height, age, gender, goal, activity) {
  const bmr = calculateBMR(weight, height, age, gender);
  const activityMultipliers = {
    low: 1.375,
    moderate: 1.55,
    high: 1.725,
  };
  const tdee = bmr * activityMultipliers[activity];
  const goalMultiplier = scientificMealData[goal].calorieMultiplier;
  return Math.round(tdee * goalMultiplier);
}

// 매크로 계산
function calculateMacros(totalCalories, goal) {
  const data = scientificMealData[goal];
  const proteinCalories = totalCalories * data.proteinRatio;
  const carbCalories = totalCalories * data.carbRatio;
  const fatCalories = totalCalories * data.fatRatio;
  return {
    protein: Math.round(proteinCalories / 4),
    carbs: Math.round(carbCalories / 4),
    fat: Math.round(fatCalories / 9),
    totalCalories: totalCalories,
  };
}

// 아코디언 토글 함수
function toggleAccordion(headerId, contentId, iconId) {
  const header = $(headerId);
  const content = $(contentId);
  const icon = $(iconId);

  // 다른 아코디언 모두 닫기
  $$('.custom-accordion-header').forEach((h) => {
    if (h.id !== headerId) h.classList.remove('active');
  });
  $$('.custom-accordion-content').forEach((c) => {
    if (c.id !== contentId) c.classList.remove('active');
  });
  $$('.accordion-icon').forEach((i) => {
    if (i.id !== iconId) i.classList.remove('rotated');
  });

  // 현재 아코디언 토글
  header.classList.toggle('active');
  content.classList.toggle('active');
  icon.classList.toggle('rotated');
}

// 전역 스코프에서 접근 가능하도록 설정
window.toggleAccordion = toggleAccordion;