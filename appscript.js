/**
 * mealStack 구독 신청 처리를 위한 Google Apps Script
 *
 * 설정 방법:
 * 1. script.google.com 접속
 * 2. 새 프로젝트 생성
 * 3. 이 코드 복사/붙여넣기
 * 4. Google Sheets 생성하여 스프레드시트 ID 설정
 * 5. 웹 앱으로 배포 (누구나 액세스 가능하게 설정)
 */

// 구독자 데이터를 저장할 Google Sheets ID
const SHEET_ID = "여기에_스프레드시트_ID_입력"; // 실제 스프레드시트 ID로 교체
const SHEET_NAME = "mealStack_subscribers";

/**
 * 웹사이트로부터 POST 요청을 받았을 때 실행되는 메인 함수
 */
function doPost(e) {
  try {
    // CORS 헤더 설정
    const response = {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "POST, GET, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type",
    };

    const data = JSON.parse(e.postData.contents);
    const { email, protein, goal, preference, description } = data;

    // 이메일 검증
    if (!email || !validateEmail(email)) {
      throw new Error("유효하지 않은 이메일 주소입니다.");
    }

    // Google Sheets에 데이터 저장
    saveToSheet(email, protein, goal, preference, description);

    // 사용자에게 이메일 발송
    sendWelcomeEmail(email, protein, goal, preference, description);

    return ContentService.createTextOutput(
      JSON.stringify({
        result: "success",
        message: "구독 신청이 완료되었습니다!",
      })
    ).setMimeType(ContentService.MimeType.JSON);
  } catch (error) {
    console.error("Error:", error);
    return ContentService.createTextOutput(
      JSON.stringify({
        result: "error",
        message: error.toString(),
      })
    ).setMimeType(ContentService.MimeType.JSON);
  }
}

/**
 * OPTIONS 요청 처리 (CORS)
 */
function doOptions() {
  return ContentService.createTextOutput("")
    .setMimeType(ContentService.MimeType.TEXT)
    .setHeaders({
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "POST, GET, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type",
    });
}

/**
 * Google Sheets에 구독자 정보 저장
 */
function saveToSheet(email, protein, goal, preference, description) {
  try {
    const sheet = SpreadsheetApp.openById(SHEET_ID).getSheetByName(SHEET_NAME);

    // 시트가 없으면 생성
    if (!sheet) {
      const newSheet =
        SpreadsheetApp.openById(SHEET_ID).insertSheet(SHEET_NAME);
      // 헤더 행 추가
      newSheet
        .getRange(1, 1, 1, 7)
        .setValues([
          ["날짜", "이메일", "단백질(g)", "목표", "선호도", "설명", "IP"],
        ]);
    }

    const targetSheet =
      sheet || SpreadsheetApp.openById(SHEET_ID).getSheetByName(SHEET_NAME);

    // 데이터 추가
    targetSheet.appendRow([
      new Date(),
      email,
      protein,
      goal,
      preference,
      description,
      getClientIP(),
    ]);

    console.log(`새 구독자 추가: ${email}`);
  } catch (error) {
    console.error("Sheet 저장 오류:", error);
    throw new Error("데이터 저장 중 오류가 발생했습니다.");
  }
}

/**
 * 환영 이메일 발송
 */
function sendWelcomeEmail(email, protein, goal, preference, description) {
  try {
    const goalTexts = {
      bulkup: "벌크업 (근육 증가)",
      lean_bulkup: "린벌크업 (깔끔한 증량)",
      cutting: "컷팅 (체지방 감소)",
      maintain: "유지 (현상 유지)",
    };

    const preferenceTexts = {
      meat: "육류 위주",
      seafood: "어류 위주",
      plant: "식물성 위주",
    };

    const subject = "🥗 mealStack 맞춤 도시락 서비스 - 사전 예약 완료!";

    const body = `
안녕하세요, ${email.split("@")[0]}님! 

mealStack 팀의 자체 벌크업 식단 도시락 예약 리스트에 등록되었습니다.
런칭되는 대로 가장 먼저 안내드리겠습니다! 🎉

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

📊 [${email.split("@")[0]}님의 맞춤 영양 분석 결과]

✅ 목표: ${goalTexts[goal] || goal}
✅ 식단 선호도: ${preferenceTexts[preference] || preference}  
✅ 일일 권장 단백질: ${protein}g
✅ 목표 설명: ${description}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

🚀 mealStack은 식단 도시락 런칭 시, 
   회원님의 목표 체형 달성을 위한 최고의 식단을 준비할 예정입니다.

더 이상 직접 번거롭게 식단을 계산하고 요리할 필요 없이,
문 앞으로 배송되는 건강하고 저렴한 식사를 제공하기 위해 
만반의 준비를 하고 있습니다.

런칭 시 특별 할인 혜택과 함께 가장 먼저 소식을 전해드리겠습니다! 💪

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

궁금한 점이 있으시면 언제든 답장 주세요!

건강한 하루 되세요! 
mealStack 팀 드림 🌟
    `;

    GmailApp.sendEmail(email, subject, body);
    console.log(`환영 이메일 발송 완료: ${email}`);
  } catch (error) {
    console.error("이메일 발송 오류:", error);
    // 이메일 발송 실패해도 구독은 저장되도록 에러를 throw하지 않음
  }
}

/**
 * 이메일 유효성 검사
 */
function validateEmail(email) {
  const re =
    /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
  return re.test(String(email).toLowerCase());
}

/**
 * 클라이언트 IP 주소 가져오기 (보안용)
 */
function getClientIP() {
  try {
    return Session.getTemporaryActiveUserKey() || "unknown";
  } catch (error) {
    return "unknown";
  }
}

/**
 * 테스트 함수 (Google Apps Script 에디터에서 실행 가능)
 */
function testFunction() {
  const testData = {
    postData: {
      contents: JSON.stringify({
        email: "test@example.com",
        protein: 120,
        goal: "bulkup",
        preference: "meat",
        description: "근육량 증가를 위한 고단백 식단",
      }),
    },
  };

  const result = doPost(testData);
  console.log("테스트 결과:", result.getContent());
}
