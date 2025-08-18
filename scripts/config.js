/**
 * 환경변수 설정 및 로딩
 * .env 파일에서 환경변수를 로드하여 전역 변수로 설정
 */

// 환경변수 저장 객체
window.ENV = window.ENV || {};

/**
 * .env 파일에서 환경변수를 로드하는 함수
 * 브라우저 환경에서는 .env 파일을 직접 읽을 수 없으므로
 * 서버에서 제공하거나 빌드 시점에 주입해야 합니다
 */
async function loadEnvVariables() {
    try {
        // .env 파일을 텍스트로 로드 시도
        const response = await fetch('./.env');
        
        if (response.ok) {
            const envText = await response.text();
            parseEnvFile(envText);
            console.log('✅ 환경변수 로드 완료');
        } else {
            // .env 파일이 없을 경우 기본값 사용
            console.log('⚠️ .env 파일을 찾을 수 없습니다. 기본값을 사용합니다.');
            setDefaultEnvVariables();
        }
    } catch (error) {
        console.log('⚠️ 환경변수 로드 실패. 기본값을 사용합니다.');
        setDefaultEnvVariables();
    }
}

/**
 * .env 파일 내용을 파싱하여 환경변수 설정
 * @param {string} envText - .env 파일 내용
 */
function parseEnvFile(envText) {
    const lines = envText.split('\n');
    
    lines.forEach(line => {
        // 주석과 빈 줄 제외
        if (line.trim() && !line.trim().startsWith('#')) {
            const [key, ...valueParts] = line.split('=');
            if (key && valueParts.length > 0) {
                const value = valueParts.join('=').trim();
                window.ENV[key.trim()] = value;
            }
        }
    });
}

/**
 * 기본 환경변수 설정 (fallback)
 */
function setDefaultEnvVariables() {
    // 프로덕션에서는 이 값들을 실제 배포된 값으로 설정해야 합니다
    window.ENV.VITE_EMAIL_API_URL = 'https://script.google.com/macros/s/AKfycbyCOwJuLBHgyC3_SIvDVHbg2pbmdfT48U0rUYf4-UBoGD_RblzekCD3_zG31IxfewYB/exec';
}

/**
 * 환경변수 값을 가져오는 헬퍼 함수
 * @param {string} key - 환경변수 키
 * @param {string} defaultValue - 기본값
 * @returns {string} 환경변수 값
 */
function getEnvVar(key, defaultValue = '') {
    return window.ENV[key] || defaultValue;
}

// 페이지 로드 시 환경변수 로드
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', loadEnvVariables);
} else {
    loadEnvVariables();
}