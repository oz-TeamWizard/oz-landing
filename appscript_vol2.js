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

    // 1. Google Sheets에 사전예약자 정보 저장
    sheet.appendRow([new Date(), email, protein, goal, description]);

    // 2. 사용자에게 발송할 사전예약 완료 및 맞춤 안내 이메일 생성
    const subject = "mealStack 맞춤 도시락 서비스, 사전 예약이 완료되었습니다!";
    
    const body = `
안녕하세요, ${email.split('@')[0]}님! mealStack입니다.

mealStack의 새로운 개인 맞춤형 건강 도시락 서비스의 예약 리스트에 추가되었습니다.
런칭되는대로 가장 먼저 안내드리겠습니다.

---

**[${email.split('@')[0]}님을 위한 맞춤 영양 분석 결과]**

저희 AI가 분석한 결과, 회원님께서는 **'${description}'** 목표 달성을 위해
하루 **${protein}g**의 단백질 섭취가 필요하신 것을 확인했습니다.

mealStack은 바로 이 결과를 바탕으로, 회원님만을 위한 최적의 영양 맞춤 도시락을 준비하고 있습니다.
더 이상 번거롭게 식단을 계산하고 요리할 필요 없이, 문 앞으로 배송되는 건강한 식사를 즐길 준비만 하세요!

런칭 시 특별한 혜택과 함께 가장 먼저 소식을 전해드리겠습니다.

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
 * 이메일 주소의 기본적인 형식이 맞는지 검사하는 헬퍼 함수입니다.
 * @param {string} email - 검사할 이메일 주소입니다.
 * @returns {boolean} - 이메일 형식이 유효하면 true, 아니면 false를 반환합니다.
 */
function validateEmail(email) {
  const re = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
  return re.test(String(email).toLowerCase());
}
