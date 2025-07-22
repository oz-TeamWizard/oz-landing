/**
 * 웹사이트로부터 POST 요청을 받았을 때 실행되는 메인 함수입니다.
 * @param {object} e - 웹 앱이 받은 요청 이벤트 객체입니다.
 */
function doPost(e) {
  try {
    // 현재 활성화된 스프레드시트의 첫 번째 시트를 가져옵니다.
    const sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();

    // 프론트엔드(웹사이트)에서 JSON 형태로 보낸 데이터를 파싱합니다.
    const data = JSON.parse(e.postData.contents);
    const { email, protein, goal, description } = data;

    // 이메일 주소가 유효한지 확인합니다. 유효하지 않으면 오류를 발생시킵니다.
    if (!email || !validateEmail(email)) {
      throw new Error("유효하지 않은 이메일 주소입니다.");
    }

    // --- 1. Google Sheets에 데이터 저장 ---
    // 시트의 마지막 행에 새로운 데이터를 추가합니다. new Date()는 현재 시간을 기록합니다.
    sheet.appendRow([new Date(), email, protein, goal, description]);

    // --- 2. 사용자에게 결과 이메일 발송 ---
    // 이메일 제목을 설정합니다.
    const subject = "맞춤형 단백질 계산기대로 관리하고 있나요? mealStack";
    
    // 이메일 본문을 생성합니다. 템플릿 리터럴(``)을 사용하여 변수 값을 쉽게 삽입합니다.
    const body = `
안녕하세요, ${email.split('@')[0]}님! mealStack입니다.

회원님의 맞춤 단백질 계산 결과를 다시 한번 보내드립니다.

✅ 목표: ${description}
✅ 일일 권장 단백질: ${protein}g

결과에 맞춰 꾸준히 관리하여 목표를 달성해보세요!
mealStack이 항상 응원하겠습니다.

감사합니다.
mealStack 팀 드림
    `;

    // GmailApp 서비스를 사용하여 사용자에게 이메일을 발송합니다.
    GmailApp.sendEmail(email, subject, body);

    // 모든 작업이 성공했을 때, 웹사이트에 성공 응답(JSON)을 보냅니다.
    return ContentService
      .createTextOutput(JSON.stringify({ result: "success" }))
      .setMimeType(ContentService.MimeType.JSON);

  } catch (error) {
    // 작업 중 오류가 발생했을 때, 웹사이트에 에러 메시지를 포함한 응답(JSON)을 보냅니다.
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

// mealStack 웹사이트와 연동하여 구독자 정보를 Google Sheets에 저장하고, 사용자에게 계산 결과를 자동으로 이메일로 발송하는 Google Apps Script 전체 코드를 생성.
// ([확장 프로그램] > [Apps Script])에서 붙여넣고 배포하시면 됩니다.
// Google Sheets + Apps Script 연동 가이드에 따라 배포 유형은 **웹 앱(Web app)**을 선택해야 합니다.
