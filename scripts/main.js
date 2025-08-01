/**
 * mealStack 애플리케이션 메인 스크립트
 * 앱 초기화 및 주요 로직 관리
 */

document.addEventListener('DOMContentLoaded', function () {
  // 선호도 라벨 클릭 이벤트 설정
  $$('.preference-label').forEach((label) => {
    label.addEventListener('click', () => {
      label.classList.toggle('selected');
    });
  });

  // 단백질 계산 폼 이벤트 리스너
  $('proteinForm').addEventListener('submit', function (e) {
    e.preventDefault();
    calculateAndDisplay();
  });

  /**
   * 단백질 계산 및 결과 표시
   */
  function calculateAndDisplay() {
    const gender = $('gender').value;
    const age = parseFloat($('age').value);
    const height = parseFloat($('height').value);
    const weight = parseFloat($('weight').value);
    const goal = $('goal').value;
    const activity = $('activity').value;

    // 입력값 검증
    if (!gender || !age || !height || !weight || !goal || !activity) {
      alert('모든 필드를 입력해주세요.');
      return;
    }

    // 선호도 검증
    const preferences = Array.from($$('.preference-label.selected')).map(el => el.dataset.value);
    if (preferences.length === 0) {
      alert('적어도 하나의 식품 종류를 선택해주세요.');
      return;
    }

    // 로딩 상태 표시
    showLoading();

    // 계산 시뮬레이션 (1.5초 딜레이)
    setTimeout(() => {
      const goalData = scientificMealData[goal];
      const totalCalories = calculateCalories(weight, height, age, gender, goal, activity);
      const macros = calculateMacros(totalCalories, goal);
      
      // 체중 기반 최소 단백질과 매크로 비율 기반 단백질 중 더 높은 값 사용
      const minProteinByWeight = Math.round(weight * goalData.proteinPerKg);
      const proteinByMacro = macros.protein;
      const totalProtein = Math.max(minProteinByWeight, proteinByMacro);
      
      // 디버그 로그
      console.log('=== 단백질 계산 디버그 ===');
      console.log('BMR 계산값:', calculateBMR(weight, height, age, gender));
      console.log('총 칼로리:', totalCalories);
      console.log('매크로 기반 단백질:', proteinByMacro);
      console.log('체중 기반 최소 단백질:', minProteinByWeight);
      console.log('최종 단백질:', totalProtein);
      
      macros.protein = totalProtein;

      // 계산 결과 저장
      lastCalculationResult = {
        protein: totalProtein,
        goal,
        preferences,
        description: goalData.description,
        calories: totalCalories,
        macros,
        gender,
        age,
        height,
        weight,
        activity,
      };

      // 로딩 숨기기 및 결과 표시
      hideLoading();
      displayResults(lastCalculationResult);
      
      // 메인 단백질 카드 표시
      $('mainProteinCard').style.display = 'block';
      $('mainProteinAmount').textContent = totalProtein + 'g';
      $('captureSection').style.display = 'block';
    }, 1500);
  }

  // 전역 스코프에서 접근 가능하도록 함수 노출
  window.lastCalculationResult = lastCalculationResult;
});