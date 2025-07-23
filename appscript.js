/**
 * 웹사이트로부터 POST 요청을 받았을 때 실행되는 메인 함수입니다.
 * @param {object} e - 웹 앱이 받은 요청 이벤트 객체입니다.
 */
function doPost(e) {
  try {
    const sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
    const data = JSON.parse(e.postData.contents);
    const { email, protein, goal, description } = data;

    if (!email || !validateEmail(email)) {
      throw new Error("유효하지 않은 이메일 주소입니다.");
    }

    // 1. Google Sheets에 데이터 저장
    sheet.appendRow([new Date(), email, protein, goal, description]);

    // 2. 사용자에게 발송할 개인화된 이메일 생성
    const subject = "맞춤형 단백질 계산기대로 관리하고 있나요? mealStack";
    
    // 사용자의 목표(goal)에 따라 추가적인 팁 메시지를 동적으로 생성합니다.
    const personalizedTip = getPersonalizedTip(goal);

    const body = `
안녕하세요, ${email.split('@')[0]}님! mealStack입니다.

회원님의 맞춤 단백질 계산 결과를 다시 한번 보내드립니다.

✅ 목표: ${description}
✅ 일일 권장 단백질: ${protein}g

${personalizedTip}

결과에 맞춰 꾸준히 관리하여 목표를 달성해보세요!
mealStack이 항상 응원하겠습니다.

감사합니다.
mealStack 팀 드림
    `;

    // 3. 이메일 발송
    GmailApp.sendEmail(email, subject, body);

    return ContentService
      .createTextOutput(JSON.stringify({ result: "success" }))
      .setMimeType(ContentService.MimeType.JSON);

  } catch (error) {
    return ContentService
      .createTextOutput(JSON.stringify({ result: "error", message: error.toString() }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

/**
 * 사용자의 목표(goal)에 따라 다른 내용의 팁을 반환하는 함수입니다.
 * @param {string} goal - 사용자가 선택한 체형 목표 (예: 'bulkup', 'cutting')
 * @returns {string} - 개인화된 팁 메시지 문자열
 */
function getPersonalizedTip(goal) {
  let tip = "--- \n\n✨ MEALSTACK'S TIP FOR YOU ✨\n\n";
  switch (goal) {
    case 'bulkup':
      tip += "성공적인 벌크업을 위해서는 운동 후 30분 내에 단백질과 약간의 탄수화물(바나나 등)을 함께 섭취하는 것이 근육 회복과 성장에 매우 효과적이랍니다.";
      break;
    case 'lean_bulkup':
      tip += "린매스업의 핵심은 '건강한 지방' 섭취입니다. 식단에 아보카도, 견과류, 올리브 오일을 추가하여 칼로리는 채우되 체지방 증가는 최소화해보세요.";
      break;
    case 'cutting':
      tip += "체지방 감량 중 근손실을 막으려면 단백질 섭취가 정말 중요해요. 특히 잠들기 전 '카제인 프로틴'을 섭취하면 수면 중 근육이 분해되는 것을 막아준답니다.";
      break;
    case 'maintain':
      tip += "체중 유지를 위해서는 꾸준함이 중요합니다. 현재 식단에서 단백질 비중을 조금만 더 높이면 포만감이 오래가서 불필요한 간식을 줄이는 데 도움이 될 거예요.";
      break;
    default:
      tip += "꾸준한 단백질 섭취는 건강한 신체를 만드는 가장 기본적인 습관입니다. 작은 실천부터 시작해보세요!";
      break;
  }
  return tip;
}

/**
 * 이메일 주소의 기본적인 형식이 맞는지 검사하는 헬퍼 함수입니다.
 * @param {string} email - 검사할 이메일 주소입니다.
 * @returns {boolean} - 이메일 형식이 유효하면 true, 아니면 false를 반환합니다.
 */
function validateEmail(email) {
  const re = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
  return re.test(String(email).toLowerCase());
}
