
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
                [
                    "날짜",
                    "이메일",
                    "단백질(g)",
                    "목표",
                    "선호도",
                    "설명",
                    "상태",
                    "IP",
                ],
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
    return ContentService.createTextOutput("").setMimeType(
        ContentService.MimeType.TEXT
    );
}

/**
 * GET 요청 처리 (테스트용)
 */
function doGet(e) {
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
    ).setMimeType(ContentService.MimeType.JSON);
}

/**
 * POST 요청 처리 (메인 함수)
 */
function doPost(e) {
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

        const { email, protein, goal, preference, description } = data;

        // Google Sheets에 데이터 저장
        const saveResult = saveToSheet(
            email,
            protein,
            goal,
            preference,
            description
        );

        if (!saveResult.success) {
            throw new Error(saveResult.error);
        }

        return ContentService.createTextOutput(
            JSON.stringify({
                result: "success",
                message: "🎉 계산이 완료되었습니다!",
                timestamp: new Date().toISOString(),
            })
        ).setMimeType(ContentService.MimeType.JSON);
    } catch (error) {
        console.error("💥 doPost 오류:", error);

        return ContentService.createTextOutput(
            JSON.stringify({
                result: "error",
                message: error.toString(),
                timestamp: new Date().toISOString(),
            })
        ).setMimeType(ContentService.MimeType.JSON);
    }
}

/**
 * Google Sheets에 구독자 정보 저장
 */
function saveToSheet(email, protein, goal, preference, description) {
    try {
        console.log("💾 Sheet 저장 시작:", {
            email,
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
                .getRange(1, 1, 1, 8)
                .setValues([
                    [
                        "날짜",
                        "이메일",
                        "단백질(g)",
                        "목표",
                        "선호도",
                        "설명",
                        "상태",
                        "IP",
                    ],
                ]);

            // 헤더 스타일 설정
            const headerRange = sheet.getRange(1, 1, 1, 8);
            headerRange.setBackground("#4285f4");
            headerRange.setFontColor("white");
            headerRange.setFontWeight("bold");
        }

        // 데이터 추가
        const newRow = [
            new Date(),
            email || "no-email",
            protein || 0,
            goal || "unknown",
            preference || "none",
            description || "no description",
            "active",
            getClientIP(),
        ];

        sheet.appendRow(newRow);

        console.log(`✅ 데이터 추가 완료`);

        // 이메일 유효성 검사 후 환영 이메일 발송 (3초 지연)
        if (email && validateEmail(email)) {
            Utilities.sleep(3000); // 3초 지연 (밀리초)
            sendWelcomeEmail(email, protein, goal, preference, description);
        } else {
            console.log("⚠️ 유효하지 않은 이메일 주소:", email);
        }

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

        const subject = "[mealStack] 맞춤 도시락 서비스 사전 예약 완료";

        const body = `
안녕하세요, ${email.split("@")[0]}님! 

mealStack 팀의 자체 벌크업 식단 도시락 예약 리스트에 등록되었습니다.
런칭되는 대로 가장 먼저 안내드리겠습니다!

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

[${email.split("@")[0]}님의 맞춤 영양 분석 결과]

✅ 목표: ${goalTexts[goal] || goal}
✅ 식단 선호도: ${preferenceTexts[preference] || preference}  
✅ 일일 권장 단백질: ${protein}g
✅ 목표 설명: ${description}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

mealStack은 식단 도시락 런칭 시, 
   회원님의 목표 체형 달성을 위한 최고의 식단을 준비할 예정입니다.

더 이상 직접 번거롭게 식단을 계산하고 요리할 필요 없이,
문 앞으로 배송되는 건강하고 저렴한 식사를 제공하기 위해 
만반의 준비를 하고 있습니다.

런칭 시 특별 할인 혜택과 함께 가장 먼저 소식을 전해드리겠습니다!

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

궁금한 점이 있으시면 언제든 답장 주세요!

건강한 하루 되세요! 
mealStack 팀 드림 
    `;

        // Gmail 발송 옵션 설정
        const options = {
            name: "mealStack 팀",
            replyTo: "noreply@mealstack.com", // 실제 도메인이 있다면 변경
            htmlBody: body.replace(/\n/g, "<br>"),
        };

        GmailApp.sendEmail(email, subject, body, options);
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
                email: "test@example.com",
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
