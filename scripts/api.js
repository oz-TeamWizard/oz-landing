/**
 * API 통신 관련 함수
 */
const EMAIL_API_URL =
    "https://script.google.com/macros/s/AKfycbyCOwJuLBHgyC3_SIvDVHbg2pbmdfT48U0rUYf4-UBoGD_RblzekCD3_zG31IxfewYB/exec"; // Google Apps Script URL (실제 배포된 URL로 교체 필요) // 원본 배포 URL
//const EMAIL_API_URL ="https://script.google.com/macros/s/AKfycbzWMfmfaojIrVY4Vj9eZGn7HURbmhQPLDJZC7uwgprAtkeWi3YG_8OZ1lGF98Fb3t4f/exec"; // 나종한 배포 URL

/**
 * 이메일 구독 신청 API 호출
 * @param {string} email - 사용자 이메일
 * @param {Object} userProfile - 사용자 프로필 정보
 */
async function sendSubscriptionEmail(email, userProfile) {
    const submitButton = document.querySelector(
        '#subscriptionForm button[type="submit"]'
    );
    const originalText = submitButton.innerHTML;
    const successMessage = $("subscriptionSuccessMessage");
    const errorMessage = $("subscriptionErrorMessage");

    // 기존 메시지 숨기기
    successMessage.style.display = "none";
    errorMessage.style.display = "none";

    // 로딩 상태 표시
    submitButton.innerHTML = '<div class="loading-spinner"></div>전송 중...';
    submitButton.disabled = true;

    try {
        const requestData = {
            email: email,
            protein: userProfile.protein || 0,
            goal: userProfile.goal || "unknown",
            preference: userProfile.preferences
                ? userProfile.preferences.join(", ")
                : "none",
            description: userProfile.description || "no description",
        };

        console.log("📧 구독 시도:", email);

        const response = await fetch(EMAIL_API_URL, {
            method: "POST",
            headers: {
                "Content-Type": "text/plain;charset=utf-8",
            },
            body: JSON.stringify(requestData),
            mode: "no-cors",
        });

        // 성공 메시지 표시
        successMessage.innerHTML = `✅ <strong>신청 완료!</strong><br/>
      사전예약 안내 신청이 접수되었습니다.`;
        successMessage.style.display = "block";
        $("emailInput").value = "";

        // 8초 후 메시지 숨기기
        setTimeout(() => {
            successMessage.style.display = "none";
        }, 8000);
    } catch (error) {
        console.error("💥 이메일 구독 오류:", error);
        errorMessage.innerHTML = `❌ <strong>오류 발생:</strong><br/>이메일 전송에 실패했습니다. 관리자에게 문의하세요.`;
        errorMessage.style.display = "block";

        setTimeout(() => {
            errorMessage.style.display = "none";
        }, 10000);
    } finally {
        // 원래 상태로 복원
        submitButton.innerHTML = originalText;
        submitButton.disabled = false;
    }
}
