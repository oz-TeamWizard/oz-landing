/**
 * 단백질 계산 및 식단 데이터 관리 모듈
 */

// 과학적 식단 데이터
const scientificMealData = {
  bulkup: {
    description: "근육량 증가를 위한 고단백 식단",
    proteinPerKg: 2.2,
    calorieMultiplier: 1.15,
    carbRatio: 0.6,
    proteinRatio: 0.3,
    fatRatio: 0.1,
    meals: {
      breakfast: {
        name: "벌크업 아침",
        foods: [
          { name: "계란", category: "meat", amount: "3개", protein: 19.5, carb: 1.5, fat: 15.0, baseAmount: 3, unit: "개" },
          { name: "현미밥", amount: "80g", protein: 6.3, carb: 58.0, fat: 2.2, baseAmount: 80, unit: "g" },
          { name: "바나나", amount: "1개", protein: 1.1, carb: 23.0, fat: 0.3, baseAmount: 1, unit: "개" },
          { name: "견과류", amount: "20g", protein: 4.0, carb: 4.0, fat: 12.0, baseAmount: 20, unit: "g" }
        ]
      },
      lunch: {
        name: "벌크업 점심",
        foods: [
          { name: "닭가슴살", category: "meat", amount: "200g", protein: 62.0, carb: 0, fat: 2.0, baseAmount: 200, unit: "g" },
          { name: "현미밥", amount: "120g", protein: 9.5, carb: 87.0, fat: 3.3, baseAmount: 120, unit: "g" },
          { name: "브로콜리", amount: "100g", protein: 2.8, carb: 7.0, fat: 0.4, baseAmount: 100, unit: "g" },
          { name: "올리브오일", amount: "10g", protein: 0, carb: 0, fat: 10.0, baseAmount: 10, unit: "g" }
        ]
      },
      dinner: {
        name: "벌크업 저녁",
        foods: [
          { name: "연어", category: "seafood", amount: "180g", protein: 45.0, carb: 0, fat: 24.0, baseAmount: 180, unit: "g" },
          { name: "고구마", amount: "150g", protein: 3.0, carb: 30.0, fat: 0.2, baseAmount: 150, unit: "g" },
          { name: "시금치", amount: "100g", protein: 2.9, carb: 2.0, fat: 0.4, baseAmount: 100, unit: "g" }
        ]
      },
      snack: {
        name: "벌크업 간식",
        foods: [
          { name: "웨이 프로틴", category: "plant", amount: "35g", protein: 28.0, carb: 3.0, fat: 1.5, baseAmount: 35, unit: "g" },
          { name: "오트밀", amount: "40g", protein: 5.4, carb: 24.0, fat: 2.4, baseAmount: 40, unit: "g" }
        ]
      }
    }
  },
  lean_bulkup: {
    description: "체지방 증가 최소화하며 근육량 증가",
    proteinPerKg: 1.9,
    calorieMultiplier: 1.08,
    carbRatio: 0.5,
    proteinRatio: 0.3,
    fatRatio: 0.2,
    meals: {
      breakfast: {
        name: "린벌크업 아침",
        foods: [
          { name: "계란흰자", category: "meat", amount: "4개", protein: 14.0, carb: 0.8, fat: 0.2, baseAmount: 4, unit: "개" },
          { name: "통밀빵", amount: "2장", protein: 6.0, carb: 24.0, fat: 2.0, baseAmount: 2, unit: "장" },
          { name: "아보카도", amount: "50g", protein: 1.0, carb: 4.0, fat: 7.5, baseAmount: 50, unit: "g" }
        ]
      },
      lunch: {
        name: "린벌크업 점심",
        foods: [
          { name: "닭가슴살", category: "meat", amount: "180g", protein: 55.8, carb: 0, fat: 1.8, baseAmount: 180, unit: "g" },
          { name: "퀴노아", category: "plant", amount: "70g", protein: 9.9, carb: 40.0, fat: 4.2, baseAmount: 70, unit: "g" },
          { name: "채소샐러드", amount: "150g", protein: 3.0, carb: 8.0, fat: 0.3, baseAmount: 150, unit: "g" }
        ]
      },
      dinner: {
        name: "린벌크업 저녁",
        foods: [
          { name: "흰살생선", category: "seafood", amount: "160g", protein: 35.2, carb: 0, fat: 1.6, baseAmount: 160, unit: "g" },
          { name: "현미밥", amount: "60g", protein: 4.7, carb: 43.5, fat: 1.7, baseAmount: 60, unit: "g" },
          { name: "브로콜리", amount: "120g", protein: 3.4, carb: 8.4, fat: 0.5, baseAmount: 120, unit: "g" }
        ]
      },
      snack: {
        name: "린벌크업 간식",
        foods: [
          { name: "그릭요거트", category: "plant", amount: "150g", protein: 15.0, carb: 9.0, fat: 0.75, baseAmount: 150, unit: "g" },
          { name: "베리류", amount: "80g", protein: 0.6, carb: 12.0, fat: 0.2, baseAmount: 80, unit: "g" }
        ]
      }
    }
  },
  cutting: {
    description: "근육량 보존하며 체지방 감소",
    proteinPerKg: 2.4,
    calorieMultiplier: 0.85,
    carbRatio: 0.4,
    proteinRatio: 0.4,
    fatRatio: 0.2,
    meals: {
      breakfast: {
        name: "컷팅 아침",
        foods: [
          { name: "계란흰자", category: "meat", amount: "5개", protein: 17.5, carb: 1.0, fat: 0.25, baseAmount: 5, unit: "개" },
          { name: "오트밀", amount: "30g", protein: 4.0, carb: 18.0, fat: 1.8, baseAmount: 30, unit: "g" },
          { name: "시금치", amount: "100g", protein: 2.9, carb: 2.0, fat: 0.4, baseAmount: 100, unit: "g" }
        ]
      },
      lunch: {
        name: "컷팅 점심",
        foods: [
          { name: "닭가슴살", category: "meat", amount: "200g", protein: 62.0, carb: 0, fat: 2.0, baseAmount: 200, unit: "g" },
          { name: "현미밥", amount: "40g", protein: 3.2, carb: 29.0, fat: 1.1, baseAmount: 40, unit: "g" },
          { name: "채소믹스", amount: "200g", protein: 4.0, carb: 10.0, fat: 0.4, baseAmount: 200, unit: "g" }
        ]
      },
      dinner: {
        name: "컷팅 저녁",
        foods: [
          { name: "흰살생선", category: "seafood", amount: "180g", protein: 39.6, carb: 0, fat: 1.8, baseAmount: 180, unit: "g" },
          { name: "브로콜리", amount: "200g", protein: 5.6, carb: 14.0, fat: 0.8, baseAmount: 200, unit: "g" }
        ]
      },
      snack: {
        name: "컷팅 간식",
        foods: [
          { name: "카제인 프로틴", category: "plant", amount: "30g", protein: 24.0, carb: 2.0, fat: 1.0, baseAmount: 30, unit: "g" }
        ]
      }
    }
  },
  maintain: {
    description: "현재 체형 및 건강 유지",
    proteinPerKg: 1.6,
    calorieMultiplier: 1.0,
    carbRatio: 0.5,
    proteinRatio: 0.3,
    fatRatio: 0.2,
    meals: {
      breakfast: {
        name: "유지 아침",
        foods: [
          { name: "계란", category: "meat", amount: "2개", protein: 13.0, carb: 1.0, fat: 10.0, baseAmount: 2, unit: "개" },
          { name: "통밀빵", amount: "2장", protein: 6.0, carb: 24.0, fat: 2.0, baseAmount: 2, unit: "장" },
          { name: "아몬드", amount: "15g", protein: 3.0, carb: 3.0, fat: 7.5, baseAmount: 15, unit: "g" }
        ]
      },
      lunch: {
        name: "유지 점심",
        foods: [
          { name: "닭가슴살", category: "meat", amount: "150g", protein: 46.5, carb: 0, fat: 1.5, baseAmount: 150, unit: "g" },
          { name: "현미밥", amount: "80g", protein: 6.3, carb: 58.0, fat: 2.2, baseAmount: 80, unit: "g" },
          { name: "채소샐러드", amount: "120g", protein: 3.0, carb: 8.0, fat: 0.5, baseAmount: 120, unit: "g" }
        ]
      },
      dinner: {
        name: "유지 저녁",
        foods: [
          { name: "두부", category: "plant", amount: "150g", protein: 12.0, carb: 4.5, fat: 6.0, baseAmount: 150, unit: "g" },
          { name: "현미밥", amount: "60g", protein: 4.7, carb: 43.5, fat: 1.7, baseAmount: 60, unit: "g" }
        ]
      },
      snack: {
        name: "유지 간식",
        foods: [
          { name: "그릭요거트", category: "plant", amount: "100g", protein: 10.0, carb: 6.0, fat: 0.5, baseAmount: 100, unit: "g" },
          { name: "사과", amount: "0.5개", protein: 0.3, carb: 13.0, fat: 0.2, baseAmount: 0.5, unit: "개" }
        ]
      }
    }
  }
};

// 전역 스코프에서 접근 가능하도록 설정
window.scientificMealData = scientificMealData;