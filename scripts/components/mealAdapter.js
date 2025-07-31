/**
 * 식단 적응 및 매크로 밸런싱 모듈
 */

/**
 * 사용자 선호도에 따라 식단 적응
 * @param {Object} baseMeals - 기본 식단 데이터
 * @param {Array} preferences - 사용자 선호도 배열 ["meat", "seafood", "plant"]
 * @returns {Object} 적응된 식단 데이터
 */
function adaptMealsByPreference(baseMeals, preferences) {
  const adaptedMeals = JSON.parse(JSON.stringify(baseMeals));

  // 대체 식품 프로필
  const foodProfiles = {
    닭가슴살: { protein: 31, carb: 0, fat: 3.6, unit: "g", category: "meat" },
    흰살생선: { protein: 22, carb: 0, fat: 2.5, unit: "g", category: "seafood" },
    두부: { protein: 8, carb: 1.9, fat: 4.8, unit: "g", category: "plant" }
  };

  // 카테고리별 대체 음식 선택
  const getReplacement = (categoryToRemove) => {
    if (categoryToRemove === "meat") {
      if (preferences.includes("seafood")) return "흰살생선";
      if (preferences.includes("plant")) return "두부";
    }
    if (categoryToRemove === "seafood") {
      if (preferences.includes("meat")) return "닭가슴살";
      if (preferences.includes("plant")) return "두부";
    }
    if (categoryToRemove === "plant") {
      if (preferences.includes("meat")) return "닭가슴살";
      if (preferences.includes("seafood")) return "흰살생선";
    }
    return null;
  };

  // 각 식사별로 음식 대체
  Object.values(adaptedMeals).forEach((meal) => {
    meal.foods = meal.foods.map((food) => {
      const foodCategory = food.category;
      if (["meat", "seafood", "plant"].includes(foodCategory) && !preferences.includes(foodCategory)) {
        const replacementName = getReplacement(foodCategory);
        if (replacementName) {
          const originalTotalProtein = food.protein;
          const replacementProfile = foodProfiles[replacementName];

          if (replacementProfile.protein === 0) return food;

          const newAmount = (originalTotalProtein / replacementProfile.protein) * 100;

          return {
            ...food,
            name: replacementName,
            category: replacementProfile.category,
            protein: originalTotalProtein,
            carb: (newAmount / 100) * replacementProfile.carb,
            fat: (newAmount / 100) * replacementProfile.fat,
            baseAmount: Math.round(newAmount),
            unit: replacementProfile.unit,
            amount: `${Math.round(newAmount)}${replacementProfile.unit}`
          };
        }
      }
      return food;
    });
  });

  return adaptedMeals;
}

/**
 * 매크로 밸런싱 알고리즘 (반복적 조정)
 * @param {Object} baseMeals - 기본 식단 데이터
 * @param {Object} targetMacros - 목표 매크로 { protein, carbs, fat }
 * @returns {Object} 밸런싱된 식단 데이터
 */
function balanceMealMacrosIteratively(baseMeals, targetMacros) {
  let adjustedMeals = JSON.parse(JSON.stringify(baseMeals));
  const dampeningFactor = 0.4;
  const maxIterations = 25;

  for (let i = 0; i < maxIterations; i++) {
    // 현재 총 매크로 계산
    let currentTotals = { protein: 0, carb: 0, fat: 0 };
    Object.values(adjustedMeals).forEach((meal) => {
      meal.foods.forEach((food) => {
        currentTotals.protein += food.protein;
        currentTotals.carb += food.carb;
        currentTotals.fat += food.fat;
      });
    });

    // 목표 대비 비율 계산
    const ratios = {
      protein: currentTotals.protein > 0 ? targetMacros.protein / currentTotals.protein : 1,
      carb: currentTotals.carb > 0 ? targetMacros.carbs / currentTotals.carb : 1,
      fat: currentTotals.fat > 0 ? targetMacros.fat / currentTotals.fat : 1
    };

    // 수렴 조건 확인 (5% 이내)
    if (Math.abs(ratios.protein - 1) < 0.05 && 
        Math.abs(ratios.carb - 1) < 0.05 && 
        Math.abs(ratios.fat - 1) < 0.05) {
      break;
    }

    // 각 음식별 조정
    Object.values(adjustedMeals).forEach((meal) => {
      meal.foods.forEach((food) => {
        const primaryNutrient = getPrimaryNutrient(food.name);
        let adjustmentRatio = ratios[primaryNutrient];

        // 지방 비율이 낮은 경우 특별 처리
        const foodTotalCalories = food.protein * 4 + food.carb * 4 + food.fat * 9;
        if (foodTotalCalories > 0) {
          const fatCalorieContribution = (food.fat * 9) / foodTotalCalories;
          if (ratios.fat < 0.98 && fatCalorieContribution > 0.3) {
            adjustmentRatio = (adjustmentRatio + ratios.fat * 2) / 3;
          }
        }

        // 댐핑 팩터 적용
        const effectiveRatio = 1 + (adjustmentRatio - 1) * dampeningFactor;

        // 기본 단위당 매크로 비율 저장
        const originalMacrosPerBase = {
          protein: food.protein / food.baseAmount,
          carb: food.carb / food.baseAmount,
          fat: food.fat / food.baseAmount
        };

        // 새로운 양 계산 (최소 1)
        let newAmount = food.baseAmount * effectiveRatio;
        newAmount = Math.max(newAmount, 1);

        // 음식 데이터 업데이트
        food.baseAmount = newAmount;
        food.protein = newAmount * originalMacrosPerBase.protein;
        food.carb = newAmount * originalMacrosPerBase.carb;
        food.fat = newAmount * originalMacrosPerBase.fat;

        // 표시 형식 업데이트
        if (food.unit === "개" || food.unit === "장") {
          food.amount = `${parseFloat(newAmount.toFixed(1))}${food.unit}`;
        } else {
          food.amount = `${Math.round(newAmount)}${food.unit}`;
        }
      });
    });
  }
  
  return adjustedMeals;
}