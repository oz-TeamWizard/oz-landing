/**
 * mealStack 구독 신청 처리 - 바로 사용 가능한 완성본
 * 배포 URL: https://script.google.com/macros/s/AKfycbwjieEzwVqwHs8BAnE2BIrHpqaB31swH3o3u70nRfZrDa__2JoVl-86EwzBx8IwhMgm/exec
 */

// 🔥 자동으로 스프레드시트를 생성하거나 기존 것을 사용
let SHEET_ID =
  PropertiesService.getScriptProperties().getProperty("MEALSTACK_SHEET_ID");
const SHEET_NAME = "mealStack_subscribers";

/**
 * 초기 설정 - 스프레드시트 자동 생성
 */
function initializeSpreadsheet() {
  if (!SHEET_ID) {
    console.log("스프레드시트 자동 생성 중...");
    const spreadsheet = SpreadsheetApp.create("mealStack 구독자 명단");
    SHEET_ID = spreadsheet.getId();

    // ID를 영구 저장
    PropertiesService.getScriptProperties().setProperty(
      "MEALSTACK_SHEET_ID",
      SHEET_ID
    );

    const sheet = spreadsheet.getActiveSheet();
    sheet.setName(SHEET_NAME);

    // 헤더 설정
    sheet
      .getRange(1, 1, 1, 8)
      .setValues([
        ["날짜", "이메일", "단백질(g)", "목표", "선호도", "설명", "상태", "IP"],
      ]);

    // 헤더 스타일
    const headerRange = sheet.getRange(1, 1, 1, 8);
    headerRange.setBackground("#4285f4");
    headerRange.setFontColor("white");
    headerRange.setFontWeight("bold");

    // 열 너비 조정
    sheet.setColumnWidth(1, 150); // 날짜
    sheet.setColumnWidth(2, 200); // 이메일
    sheet.setColumnWidth(3, 100); // 단백질
    sheet.setColumnWidth(4, 120); // 목표
    sheet.setColumnWidth(5, 150); // 선호도
    sheet.setColumnWidth(6, 250); // 설명
    sheet.setColumnWidth(7, 80); // 상태
    sheet.setColumnWidth(8, 100); // IP

    console.log("✅ 스프레드시트 생성 완료!");
    console.log("📊 스프레드시트 ID:", SHEET_ID);
    console.log("🔗 URL:", spreadsheet.getUrl());

    return SHEET_ID;
  }
  return SHEET_ID;
}

/**
 * OPTIONS 요청 처리 (CORS 프리플라이트)
 */
function doOptions() {
  return ContentService.createTextOutput("")
    .setMimeType(ContentService.MimeType.TEXT)
    .setHeaders({
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "POST, GET, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type",
      "Access-Control-Max-Age": "86400",
    });
}

/**
 * GET 요청 처리 (테스트용)
 */
function doGet(e) {
  const headers = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "POST, GET, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
  };

  // 스프레드시트 초기화
  const sheetId = initializeSpreadsheet();

  return ContentService.createTextOutput(
    JSON.stringify({
      result: "success",
      message: "mealStack API가 정상적으로 작동중입니다! 🚀",
      timestamp: new Date().toISOString(),
      spreadsheet_id: sheetId,
      spreadsheet_url: `https://docs.google.com/spreadsheets/d/${sheetId}/edit`,
    })
  )
    .setMimeType(ContentService.MimeType.JSON)
    .setHeaders(headers);
}

/**
 * POST 요청 처리 (메인 함수)
 */
function doPost(e) {
  const headers = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "POST, GET, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
  };

  try {
    console.log("📨 POST 요청 받음:", e);

    // 스프레드시트 초기화
    initializeSpreadsheet();

    // 요청 데이터 파싱
    let data;
    try {
      if (e.postData && e.postData.contents) {
        data = JSON.parse(e.postData.contents);
      } else {
        throw new Error("요청 데이터가 없습니다.");
      }
    } catch (parseError) {
      console.error("❌ JSON 파싱 오류:", parseError);
      throw new Error("잘못된 JSON 형식입니다.");
    }

    console.log("📋 파싱된 데이터:", data);

    const { protein, goal, preference, description } = data;

    // Google Sheets에 데이터 저장
    const saveResult = saveToSheet(protein, goal, preference, description);

    if (!saveResult.success) {
      throw new Error(saveResult.error);
    }

    return ContentService.createTextOutput(
      JSON.stringify({
        result: "success",
        message: "🎉 계산이 완료되었습니다!",
        timestamp: new Date().toISOString(),
      })
    )
      .setMimeType(ContentService.MimeType.JSON)
      .setHeaders(headers);
  } catch (error) {
    console.error("💥 doPost 오류:", error);
    return ContentService.createTextOutput(
      JSON.stringify({
        result: "error",
        message: error.toString(),
        timestamp: new Date().toISOString(),
      })
    )
      .setMimeType(ContentService.MimeType.JSON)
      .setHeaders(headers);
  }
}

/**
 * Google Sheets에 구독자 정보 저장
 */
function saveToSheet(protein, goal, preference, description) {
  try {
    console.log("💾 Sheet 저장 시작:", {
      protein,
      goal,
      preference,
      description,
    });

    if (!SHEET_ID) {
      return {
        success: false,
        error: "스프레드시트 초기화에 실패했습니다.",
      };
    }

    // 스프레드시트 열기
    let spreadsheet;
    try {
      spreadsheet = SpreadsheetApp.openById(SHEET_ID);
    } catch (sheetError) {
      console.error("📊 스프레드시트 열기 오류:", sheetError);
      return {
        success: false,
        error: `스프레드시트를 찾을 수 없습니다. (ID: ${SHEET_ID})`,
      };
    }

    let sheet = spreadsheet.getSheetByName(SHEET_NAME);

    // 시트가 없으면 생성
    if (!sheet) {
      console.log("📝 새 시트 생성:", SHEET_NAME);
      sheet = spreadsheet.insertSheet(SHEET_NAME);

      // 헤더 행 추가
      sheet
        .getRange(1, 1, 1, 7)
        .setValues([
          ["날짜", "단백질(g)", "목표", "선호도", "설명", "상태", "IP"],
        ]);

      // 헤더 스타일 설정
      const headerRange = sheet.getRange(1, 1, 1, 7);
      headerRange.setBackground("#4285f4");
      headerRange.setFontColor("white");
      headerRange.setFontWeight("bold");
    }

    // 데이터 추가
    const newRow = [
      new Date(),
      protein || 0,
      goal || "unknown",
      preference || "none",
      description || "no description",
      "active",
      getClientIP(),
    ];

    sheet.appendRow(newRow);

    console.log(`✅ 데이터 추가 완료`);
    return { success: true };
  } catch (error) {
    console.error("💥 Sheet 저장 오류:", error);
    return {
      success: false,
      error: "데이터 저장 중 오류가 발생했습니다: " + error.message,
    };
  }
}

/**
 * 클라이언트 IP 주소 가져오기
 */
function getClientIP() {
  try {
    return Session.getTemporaryActiveUserKey() || "unknown";
  } catch (error) {
    return "unknown";
  }
}

/**
 * 수동 스프레드시트 생성 함수 (선택사항)
 */
function createSpreadsheetManually() {
  const sheetId = initializeSpreadsheet();
  const spreadsheet = SpreadsheetApp.openById(sheetId);

  console.log("✅ 스프레드시트 생성 완료!");
  console.log("📊 스프레드시트 ID:", sheetId);
  console.log("🔗 URL:", spreadsheet.getUrl());

  return spreadsheet.getUrl();
}

/**
 * 테스트 함수
 */
function testFunction() {
  console.log("🧪 === mealStack API 테스트 시작 ===");

  // 스프레드시트 초기화 테스트
  const sheetId = initializeSpreadsheet();
  console.log("📊 스프레드시트 ID:", sheetId);

  // POST 요청 테스트
  const testData = {
    postData: {
      contents: JSON.stringify({
        protein: 120,
        goal: "bulkup",
        preference: "meat, seafood",
        description: "근육량 증가를 위한 고단백 식단",
      }),
    },
  };

  const result = doPost(testData);
  console.log("✅ 테스트 결과:", result.getContent());
  console.log("🧪 === 테스트 완료 ===");
}
