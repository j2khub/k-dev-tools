export interface Tool {
  name: string;
  description: string;
  href: string;
  category: string;
}

export const tools: Tool[] = [
  // ── PDF ──
  {
    name: "PDF 분할",
    description: "PDF 파일을 원하는 페이지 범위로 분할합니다",
    href: "/tools/pdf-split",
    category: "PDF",
  },
  {
    name: "PDF 병합",
    description: "여러 PDF 파일을 하나로 합칩니다",
    href: "/tools/pdf-merge",
    category: "PDF",
  },
  {
    name: "PDF → 이미지",
    description: "PDF 파일의 각 페이지를 이미지로 변환합니다",
    href: "/tools/pdf-to-image",
    category: "PDF",
  },
  {
    name: "이미지 → PDF",
    description: "여러 이미지를 하나의 PDF 파일로 변환합니다",
    href: "/tools/image-to-pdf",
    category: "PDF",
  },
  {
    name: "PDF 텍스트 추출",
    description: "PDF 파일에서 텍스트를 추출합니다",
    href: "/tools/pdf-text-extract",
    category: "PDF",
  },
  {
    name: "PDF 페이지 회전",
    description: "PDF 페이지를 원하는 각도로 회전합니다",
    href: "/tools/pdf-rotate",
    category: "PDF",
  },
  {
    name: "PDF 페이지 재정렬",
    description: "PDF 페이지 순서를 변경하거나 특정 페이지를 삭제합니다",
    href: "/tools/pdf-reorder",
    category: "PDF",
  },
  // ── 계산기 ──
  {
    name: "백분율 계산기",
    description: "백분율 계산, 비율 구하기, 증감률을 계산합니다",
    href: "/tools/percentage-calc",
    category: "계산기",
  },
  {
    name: "날짜 차이 계산기",
    description: "두 날짜 사이의 일수, 주, 월, 년 차이를 계산합니다",
    href: "/tools/date-diff",
    category: "계산기",
  },
  {
    name: "디데이 계산기",
    description: "특정 날짜까지 남은 일수를 계산합니다",
    href: "/tools/dday-calc",
    category: "계산기",
  },
  {
    name: "단위 변환기",
    description: "길이, 무게, 온도, 속도 단위를 상호 변환합니다",
    href: "/tools/unit-converter",
    category: "계산기",
  },
  {
    name: "BMI 계산기",
    description: "키와 몸무게로 체질량지수(BMI)를 계산합니다",
    href: "/tools/bmi-calc",
    category: "계산기",
  },
  {
    name: "연봉/실수령액 계산기",
    description: "연봉을 입력하면 4대보험, 소득세 등을 공제한 월 실수령액을 계산합니다",
    href: "/tools/salary-calc",
    category: "계산기",
  },
  {
    name: "부가세 계산기",
    description: "부가세(VAT) 10%를 포함하거나 분리하여 계산합니다",
    href: "/tools/vat-calc",
    category: "계산기",
  },
  {
    name: "대출이자 계산기",
    description: "원리금균등상환 또는 원금균등상환 방식으로 대출 이자와 월 납입금을 계산합니다",
    href: "/tools/loan-calc",
    category: "계산기",
  },
  {
    name: "퇴직금 계산기",
    description: "근로기준법에 따라 1년 이상 근무한 근로자의 퇴직금을 계산합니다",
    href: "/tools/severance-calc",
    category: "계산기",
  },
  {
    name: "시급 계산기",
    description: "월급을 시급으로 또는 시급을 월급/연봉으로 변환합니다",
    href: "/tools/hourly-wage",
    category: "계산기",
  },
  {
    name: "평수 변환기",
    description: "평(坪)과 제곱미터(㎡)를 상호 변환합니다",
    href: "/tools/pyeong-calc",
    category: "계산기",
  },
  {
    name: "데이터 용량 변환기",
    description: "데이터 용량 단위를 상호 변환합니다 (B, KB, MB, GB, TB, PB)",
    href: "/tools/data-unit",
    category: "계산기",
  },
  // ── 변환 ──
  {
    name: "JSON 포매터",
    description: "JSON 데이터를 보기 좋게 정리하고 유효성을 검사합니다",
    href: "/tools/json-formatter",
    category: "변환",
  },
  {
    name: "CSV → JSON",
    description: "CSV 데이터를 JSON 형식으로 변환합니다",
    href: "/tools/csv-to-json",
    category: "변환",
  },
  {
    name: "JSON → CSV",
    description: "JSON 데이터를 CSV 형식으로 변환합니다",
    href: "/tools/json-to-csv",
    category: "변환",
  },
  {
    name: "YAML → JSON",
    description: "YAML 설정 파일을 JSON으로 변환합니다",
    href: "/tools/yaml-to-json",
    category: "변환",
  },
  {
    name: "JSON → YAML",
    description: "JSON 데이터를 YAML 형식으로 변환합니다",
    href: "/tools/json-to-yaml",
    category: "변환",
  },
  {
    name: "XML → JSON",
    description: "XML 데이터를 JSON 구조로 변환합니다",
    href: "/tools/xml-to-json",
    category: "변환",
  },
  {
    name: "쿼리 파라미터 → JSON",
    description: "URL 쿼리 문자열을 JSON 객체로 파싱합니다",
    href: "/tools/query-params-to-json",
    category: "변환",
  },
  {
    name: "마크다운 → HTML",
    description: "마크다운 텍스트를 HTML 코드로 변환합니다",
    href: "/tools/markdown-to-html",
    category: "변환",
  },
  // ── 텍스트 ──
  {
    name: "텍스트 Diff 비교",
    description: "두 텍스트의 차이점을 비교하여 강조 표시합니다",
    href: "/tools/text-diff",
    category: "텍스트",
  },
  {
    name: "마크다운 미리보기",
    description: "마크다운 텍스트를 실시간으로 렌더링하여 미리봅니다",
    href: "/tools/markdown-preview",
    category: "텍스트",
  },
  {
    name: "글자수/단어수 카운터",
    description: "텍스트의 글자수, 단어수, 줄수 등을 실시간으로 계산합니다",
    href: "/tools/char-counter",
    category: "텍스트",
  },
  {
    name: "한글 ↔ 유니코드",
    description: "한글 텍스트와 유니코드 코드포인트를 상호 변환합니다",
    href: "/tools/hangul-unicode",
    category: "텍스트",
  },
  {
    name: "EUC-KR ↔ UTF-8",
    description: "EUC-KR과 UTF-8 인코딩을 상호 변환합니다",
    href: "/tools/euckr-utf8",
    category: "텍스트",
  },
  {
    name: "음력 ↔ 양력 변환기",
    description: "음력 날짜와 양력 날짜를 상호 변환합니다",
    href: "/tools/lunar-calendar",
    category: "텍스트",
  },
  {
    name: "전화번호 포매터",
    description: "한국 전화번호를 올바른 형식으로 변환합니다",
    href: "/tools/phone-formatter",
    category: "텍스트",
  },
  {
    name: "한글 자모 분리/조합기",
    description: "한글의 자음과 모음을 분리하거나 조합합니다",
    href: "/tools/jamo-tool",
    category: "텍스트",
  },
  {
    name: "금액 한글 변환기",
    description: "숫자 금액을 한글 표기로 변환합니다",
    href: "/tools/amount-to-korean",
    category: "텍스트",
  },
  // ── 이미지 ──
  {
    name: "이미지 리사이즈",
    description: "이미지 크기를 원하는 비율이나 픽셀로 조절합니다",
    href: "/tools/image-resizer",
    category: "이미지",
  },
  {
    name: "이미지 압축",
    description: "이미지 용량을 줄입니다. 품질과 최대 폭을 조절할 수 있습니다",
    href: "/tools/image-compress",
    category: "이미지",
  },
  {
    name: "WebP 변환기",
    description: "이미지를 WebP 포맷으로 변환합니다",
    href: "/tools/webp-converter",
    category: "이미지",
  },
  {
    name: "SVG 뷰어",
    description: "SVG 코드를 붙여넣으면 실시간으로 미리보기합니다",
    href: "/tools/svg-viewer",
    category: "이미지",
  },
  {
    name: "이미지 → Base64",
    description: "이미지 파일을 Base64 문자열로 변환합니다",
    href: "/tools/image-to-base64",
    category: "이미지",
  },
  {
    name: "Base64 → 이미지",
    description: "Base64 문자열을 이미지로 변환하여 미리보기합니다",
    href: "/tools/base64-to-image",
    category: "이미지",
  },
  {
    name: "HEX → RGB 변환",
    description: "HEX 색상 코드를 RGB 값으로 변환합니다",
    href: "/tools/hex-to-rgb",
    category: "이미지",
  },
  {
    name: "RGB → HEX 변환",
    description: "RGB 값을 HEX 색상 코드로 변환합니다",
    href: "/tools/rgb-to-hex",
    category: "이미지",
  },
  {
    name: "WCAG 색상 대비 검사",
    description: "전경/배경 색상의 대비율과 접근성 기준 충족 여부를 확인합니다",
    href: "/tools/wcag-contrast",
    category: "이미지",
  },
  {
    name: "색상 피커/팔레트",
    description: "색상을 선택하고 다양한 형식으로 변환하며 팔레트를 생성합니다",
    href: "/tools/color-picker",
    category: "이미지",
  },
  // ── 생성기 ──
  {
    name: "UUID 생성기",
    description: "랜덤 UUID v4를 생성합니다",
    href: "/tools/uuid-generator",
    category: "생성기",
  },
  {
    name: "해시 생성기",
    description: "SHA-256, SHA-512, MD5 해시를 생성합니다",
    href: "/tools/hash-generator",
    category: "생성기",
  },
  {
    name: "랜덤 문자열 생성기",
    description: "지정한 길이와 옵션으로 랜덤 문자열을 생성합니다",
    href: "/tools/random-string",
    category: "생성기",
  },
  {
    name: "Lorem Ipsum 생성기",
    description: "더미 텍스트를 원하는 분량만큼 생성합니다",
    href: "/tools/lorem-ipsum",
    category: "생성기",
  },
  {
    name: "Cron 표현식 생성기",
    description: "Cron 표현식을 생성하고 다음 실행 시간을 확인합니다",
    href: "/tools/cron-generator",
    category: "생성기",
  },
  {
    name: "QR 코드 생성기",
    description: "텍스트나 URL을 QR 코드로 생성합니다",
    href: "/tools/qr-generator",
    category: "생성기",
  },
  // ── 개발도구 ──
  {
    name: "CSS 인라이너",
    description: "CSS 스타일을 HTML 인라인 스타일로 변환합니다",
    href: "/tools/css-inliner",
    category: "개발도구",
  },
  {
    name: "CSS 단위 변환",
    description: "px과 rem 단위를 상호 변환합니다",
    href: "/tools/css-units",
    category: "개발도구",
  },
  {
    name: "cURL → fetch 변환",
    description: "cURL 명령을 JavaScript fetch 코드로 변환합니다",
    href: "/tools/curl-to-fetch",
    category: "개발도구",
  },
  {
    name: "타임스탬프 ↔ 날짜",
    description: "Unix 타임스탬프와 날짜/시간을 상호 변환합니다",
    href: "/tools/timestamp",
    category: "개발도구",
  },
  {
    name: "HAR 파일 뷰어",
    description: "HAR 파일을 업로드하여 HTTP 요청/응답을 분석합니다",
    href: "/tools/har-viewer",
    category: "개발도구",
  },
  {
    name: "CSV 파일 뷰어",
    description: "CSV 파일을 업로드하여 테이블로 보고 필터링합니다",
    href: "/tools/csv-viewer",
    category: "개발도구",
  },
  {
    name: "Base64 인코딩/디코딩",
    description: "텍스트를 Base64로 인코딩하거나 디코딩합니다",
    href: "/tools/base64",
    category: "개발도구",
  },
  {
    name: "URL 인코딩/디코딩",
    description: "URL을 안전한 형식으로 인코딩하거나 디코딩합니다",
    href: "/tools/url-encoder",
    category: "개발도구",
  },
  {
    name: "JWT 파서",
    description: "JSON Web Token을 디코딩하여 헤더와 페이로드를 확인합니다",
    href: "/tools/jwt-parser",
    category: "개발도구",
  },
  {
    name: "진법 변환기",
    description: "2진수, 8진수, 10진수, 16진수를 상호 변환합니다",
    href: "/tools/number-base",
    category: "개발도구",
  },
  {
    name: "Regex 테스터",
    description: "정규식을 실시간으로 테스트하고 매칭 결과를 확인합니다",
    href: "/tools/regex-tester",
    category: "개발도구",
  },
  {
    name: "SQL 미니파이어",
    description: "SQL 쿼리에서 주석과 공백을 제거하여 압축합니다",
    href: "/tools/sql-minifier",
    category: "개발도구",
  },
  {
    name: "서브넷 계산기",
    description: "IP 주소와 CIDR 표기법으로 서브넷 정보를 계산합니다",
    href: "/tools/subnet-calc",
    category: "개발도구",
  },
  {
    name: "다운로드 시간 계산기",
    description: "파일 크기와 다운로드 속도를 입력하여 예상 다운로드 시간을 계산합니다",
    href: "/tools/download-time",
    category: "개발도구",
  },
  {
    name: "파일 크기 계산기",
    description: "총 파일 용량 및 이미지/동영상 저장 공간을 계산합니다",
    href: "/tools/file-size-calc",
    category: "개발도구",
  },
];

export const categories = [...new Set(tools.map((t) => t.category))];
