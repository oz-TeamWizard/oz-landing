/**
 * UI 조작 및 이벤트 핸들링 모듈
 */

let lastCalculationResult = null;

/**
 * 결과 표시 함수
 * @param {Object} result - 계산 결과 객체
 */
function displayResults(result) {
  const { protein, description, calories, macros } = result;

  $('goalDescription').textContent = description;

  $('nutritionBreakdown').innerHTML = `
    <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
      <div class="bg-red-500/20 p-4 rounded-lg border border-red-500">
        <div class="font-bold text-white">💪 필요 단백질</div>
        <div class="text-2xl font-black text-white">${protein}g</div>
      </div>
      <div class="bg-gray-500/20 p-4 rounded-lg">
        <div class="font-bold text-white">🔥 필요 칼로리</div>
        <div class="text-2xl font-black text-white">${calories}kcal</div>
      </div>
      <div class="bg-gray-500/20 p-4 rounded-lg">
        <div class="font-bold text-white">🍚 필요 탄수화물</div>
        <div class="text-2xl font-black text-white">${macros.carbs}g</div>
      </div>
      <div class="bg-gray-500/20 p-4 rounded-lg">
        <div class="font-bold text-white">🥑 필요 지방</div>
        <div class="text-2xl font-black text-white">${macros.fat}g</div>
      </div>
    </div>
  `;

  $('resultSectionWrapper').style.display = 'block';
  $('resultSectionWrapper').scrollIntoView({ behavior: 'smooth', block: 'start' });
  displayScientificMealPlans(result);
}

/**
 * 쇼핑 리스트 HTML 생성
 * @param {Object} meals - 식단 데이터
 * @returns {string} HTML 문자열
 */
function createShoppingListHtml(meals) {
  const ingredients = new Map();
  Object.values(meals).forEach((meal) => {
    meal.foods.forEach((food) => {
      if (!ingredients.has(food.name)) {
        ingredients.set(food.name, food);
      }
    });
  });

  const aggregatedIngredients = Array.from(ingredients.values());
  aggregatedIngredients.sort((a, b) => a.name.localeCompare(b.name));

  let html = `<div class="input-card p-8 mb-8 shadow-lg">
    <h4 class="text-center text-xl mb-4 font-bold"><i class="fas fa-shopping-cart text-primary-red"></i> 쇼핑리스트</h4>
    <p class="text-center text-gray-400 text-sm mb-6">아래 식재료들을 클릭하면 쿠팡에서 바로 구매할 수 있습니다!</p>
    <div class="d-flex flex-wrap justify-content-center gap-3">`;

  aggregatedIngredients.forEach((ing) => {
    const link = `https://www.coupang.com/np/search?q=${encodeURIComponent(ing.name)}&channel=user`;
    html += `<a href="${link}" target="_blank" class="bg-card-bg text-text-light px-4 py-2 border border-border-color rounded-full cursor-pointer font-medium whitespace-nowrap hover:border-primary-red hover:text-white transition-all duration-200">
      ${ing.name}
    </a>`;
  });

  html += `</div></div>`;
  return html;
}

/**
 * 구독 카드 HTML 생성
 * @returns {string} HTML 문자열
 */
function createSubscriptionCardHtml() {
  return `<div class="input-card p-8 my-8 shadow-lg text-center">
    <h4 class="text-xl md:text-2xl font-bold mb-2 text-white">mealStack 맞춤 도시락 사전예약</h4>
    <p class="text-base text-gray-300 mb-4">
      저희 팀은 2만원대 벌크업 도시락(벌크업 하루 단백질 충족) 런칭을 준비하고 있습니다.<br />
      런칭한다면, 가장 먼저 메일로 안내를 드릴게요!
    </p>
    <form id="subscriptionForm" class="flex flex-col sm:flex-row justify-center items-center">
      <input type="email" id="emailInput" class="form-control w-full sm:w-2/3 mb-2 sm:mb-0" placeholder="your-email@example.com" required />
      <button type="submit" class="btn btn-primary ml-0 sm:ml-2 w-full sm:w-auto">
        <i class="fas fa-bell"></i> 사전예약 알림받기
      </button>
    </form>
    <div id="subscriptionSuccessMessage" class="alert-success" style="display:none;"></div>
    <div id="subscriptionErrorMessage" class="alert-error" style="display:none;"></div>
    
    <p class="text-gray-500 text-sm mt-4">또는 SNS 채널을 팔로우하고 소식을 받아보세요!</p>
    <div class="mt-3">
      <a href="#" aria-label="YouTube" class="text-gray-400 hover:text-white mx-3 text-3xl transition-colors"><i class="fab fa-youtube"></i></a>
      <a href="#" aria-label="Instagram" class="text-gray-400 hover:text-white mx-3 text-3xl transition-colors"><i class="fab fa-instagram"></i></a>
    </div>
  </div>`;
}

/**
 * 최종 영양소 요약 카드 생성
 * @param {Object} finalTotals - 최종 영양소 합계
 * @param {Object} targetMacros - 목표 매크로
 * @returns {string} HTML 문자열
 */
function createTotalNutritionCard(finalTotals, targetMacros) {
  const proteinAch = Math.round((finalTotals.protein / targetMacros.protein) * 100);
  const carbAch = Math.round((finalTotals.carb / targetMacros.carbs) * 100);
  const fatAch = Math.round((finalTotals.fat / targetMacros.fat) * 100);
  const calAch = Math.round((finalTotals.calories / targetMacros.totalCalories) * 100);

  const getAchColor = (rate) =>
    rate >= 90 && rate <= 110 ? "text-green-400" :
    rate >= 80 && rate <= 120 ? "text-yellow-400" : "text-red-400";

  return `<div class="input-card p-8 my-8 shadow-lg border-2 border-primary-red">
    <h4 class="text-center text-primary-red text-2xl mb-6 font-bold"><i class="fas fa-check-circle"></i> 최종 식단 요약</h4>
    <div class="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
      <div>
        <div class="text-gray-400 text-sm">단백질</div>
        <div class="text-2xl font-bold">${finalTotals.protein.toFixed(1)}g</div>
        <div class="font-bold ${getAchColor(proteinAch)}">목표 영양치의 ${proteinAch}%</div>
      </div>
      <div>
        <div class="text-gray-400 text-sm">탄수화물</div>
        <div class="text-2xl font-bold">${finalTotals.carb.toFixed(1)}g</div>
        <div class="font-bold ${getAchColor(carbAch)}">목표 영양치의 ${carbAch}%</div>
      </div>
      <div>
        <div class="text-gray-400 text-sm">지방</div>
        <div class="text-2xl font-bold">${finalTotals.fat.toFixed(1)}g</div>
        <div class="font-bold ${getAchColor(fatAch)}">목표 영양치의 ${fatAch}%</div>
      </div>
      <div>
        <div class="text-gray-400 text-sm">칼로리</div>
        <div class="text-2xl font-bold">${Math.round(finalTotals.calories)}kcal</div>
        <div class="font-bold ${getAchColor(calAch)}">목표 영양치의 ${calAch}%</div>
      </div>
    </div>
    <div class="text-center mt-6 p-4 rounded-lg" style="background-color: rgba(220, 38, 38, 0.1); border: 1px solid rgba(220, 38, 38, 0.3);">
      <p class="text-gray-300 text-sm mb-0">
        <i class="fas fa-lightbulb text-yellow-400"></i> 
        목표 영양치 참고 후 식단에서 부족한 부분은 더 드셔도 좋습니다!
      </p>
    </div>
  </div>`;
}

/**
 * 과학적 식단 표시
 * @param {Object} result - 계산 결과
 */
function displayScientificMealPlans(result) {
  const { goal, preferences, macros } = result;
  const mealPlansSection = $('mealPlansSection');
  const mealPlansContainer = $('mealPlans');

  let baseMeals = JSON.parse(JSON.stringify(scientificMealData[goal].meals));
  let adaptedForPrefs = adaptMealsByPreference(baseMeals, preferences);
  let adaptedMeals = balanceMealMacrosIteratively(adaptedForPrefs, macros);

  let finalTotals = { protein: 0, carb: 0, fat: 0, calories: 0 };
  let mealCardsHtml = `<div class="my-8">`;
  let isFirst = true;

  Object.keys(adaptedMeals).forEach((mealKey, index) => {
    const mealData = adaptedMeals[mealKey];
    let mealProtein = mealData.foods.reduce((sum, food) => sum + food.protein, 0);
    let mealCarb = mealData.foods.reduce((sum, food) => sum + food.carb, 0);
    let mealFat = mealData.foods.reduce((sum, food) => sum + food.fat, 0);
    let mealCalories = mealProtein * 4 + mealCarb * 4 + mealFat * 9;

    finalTotals.protein += mealProtein;
    finalTotals.carb += mealCarb;
    finalTotals.fat += mealFat;
    finalTotals.calories += mealCalories;

    const headerId = `header-${index}`;
    const contentId = `content-${index}`;
    const iconId = `icon-${index}`;

    mealCardsHtml += `
      <div class="custom-accordion-item">
        <div class="custom-accordion-header ${isFirst ? "active" : ""}" 
             id="${headerId}"
             onclick="toggleAccordion('${headerId}', '${contentId}', '${iconId}')">
          <span>${mealData.name} (💪 ${mealProtein.toFixed(0)}g)</span>
          <i class="fas fa-chevron-down accordion-icon ${isFirst ? "rotated" : ""}" id="${iconId}"></i>
        </div>
        <div class="custom-accordion-content ${isFirst ? "active" : ""}" id="${contentId}">
          <div class="custom-accordion-body">`;

    mealData.foods.forEach((food) => {
      const link = `https://www.coupang.com/np/search?q=${encodeURIComponent(food.name)}&channel=user`;
      mealCardsHtml += `
        <div class="flex justify-between items-center py-2 border-b border-border-color">
          <a href="${link}" target="_blank" class="hover:text-primary-red" style="color: var(--text-light);">
            ${food.name} (${food.amount})
          </a>
          <span class="bg-red-600 text-white text-xs font-bold px-3 py-1 rounded-full">
            ${food.protein.toFixed(1)}g
          </span>
        </div>`;
    });

    mealCardsHtml += `
          <div class="mt-4 p-3 rounded-lg" style="background-color: rgba(0,0,0,0.2);">
            <div class="text-center text-sm text-white/80">
              탄수화물: ${mealCarb.toFixed(1)}g | 지방: ${mealFat.toFixed(1)}g
            </div>
            <div class="text-center text-sm text-white/80 mt-1">
              🔥 ${mealData.name} 칼로리: ${Math.round(mealCalories)}kcal
            </div>
          </div>
        </div>
        </div>
      </div>`;
    isFirst = false;
  });

  mealCardsHtml += `</div>`;

  const shoppingListHtml = createShoppingListHtml(adaptedMeals);
  const totalNutritionHtml = createTotalNutritionCard(finalTotals, macros);
  const subscriptionHtml = createSubscriptionCardHtml();

  mealPlansContainer.innerHTML = shoppingListHtml + mealCardsHtml + totalNutritionHtml + subscriptionHtml;
  mealPlansSection.style.display = 'block';

  // 이메일 구독 이벤트 리스너 추가
  $('subscriptionForm').addEventListener('submit', async function (e) {
    e.preventDefault();
    const email = $('emailInput').value.trim();

    if (!email) {
      $('subscriptionErrorMessage').innerHTML = "❌ 이메일 주소를 입력해주세요.";
      $('subscriptionErrorMessage').style.display = "block";
      setTimeout(() => {
        $('subscriptionErrorMessage').style.display = "none";
      }, 3000);
      return;
    }

    if (lastCalculationResult) {
      await sendSubscriptionEmail(email, lastCalculationResult);
    } else {
      await sendSubscriptionEmail(email, {
        protein: 0,
        goal: 'unknown',
        preferences: [],
        description: '정보 없음'
      });
    }
  });
}

/**
 * 결과 캡처 함수
 */
function captureResult() {
  const mealPlansSection = $('mealPlansSection');
  if (!lastCalculationResult || !mealPlansSection) {
    alert('먼저 계산을 완료해주세요.');
    return;
  }
  alert('식단표를 이미지로 저장합니다. 잠시만 기다려주세요...');
  html2canvas(mealPlansSection, {
    backgroundColor: '#1a1a1a',
    scale: 1.5,
  })
    .then((canvas) => {
      const link = document.createElement('a');
      link.download = `mealStack_plan_${new Date().toISOString().slice(0, 10)}.png`;
      link.href = canvas.toDataURL('image/png');
      link.click();
    })
    .catch((err) => {
      console.error('캡처 오류:', err);
      alert('이미지 저장에 실패했습니다.');
    });
}

/**
 * 결과 공유 함수
 */
function shareResult() {
  if (!lastCalculationResult) return;
  const { protein, goal, calories } = lastCalculationResult;
  const goalKorean = document.querySelector(`#goal option[value=${goal}]`).textContent;
  const shareText = `🔥 나의 맞춤 식단 결과!\n\n💪 단백질: ${protein}g\n🎯 목표: ${goalKorean}\n📊 칼로리: ${calories}kcal\n\nmealStack에서 당신만의 완벽한 식단을을 찾아보세요!`;
  
  if (navigator.share) {
    navigator.share({
      title: 'mealStack 맞춤 식단 결과',
      text: shareText,
      url: window.location.href,
    });
  } else {
    navigator.clipboard
      .writeText(`${shareText}\n${window.location.href}`)
      .then(() => alert('결과가 클립보드에 복사되었습니다!'));
  }
}

// 전역 함수로 노출
window.captureResult = captureResult;
window.shareResult = shareResult;