# 주소 검색 API

도로명주소 API를 사용하여 주소를 검색하는 Next.js App Router API입니다.

## 엔드포인트

- **GET** `/api/address/search` - 쿼리 파라미터로 검색
- **POST** `/api/address/search` - 요청 본문으로 검색

## 사용법

### GET 요청 예시

```typescript
// 기본 검색
const response = await fetch('/api/address/search?keyword=강남대로');

// 페이지네이션과 함께 검색
const response = await fetch('/api/address/search?keyword=강남대로&currentPage=1&countPerPage=20');

// 정렬 옵션과 함께 검색
const response = await fetch('/api/address/search?keyword=강남대로&firstSort=road&addInfoYn=Y');
```

### POST 요청 예시

```typescript
const response = await fetch('/api/address/search', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    keyword: '강남대로',
    currentPage: 1,
    countPerPage: 20,
    resultType: 'json',
    hstryYn: 'N',
    firstSort: 'none',
    addInfoYn: 'N',
  }),
});
```

## 파라미터

| 파라미터       | 타입                           | 필수 | 기본값 | 설명                      |
| -------------- | ------------------------------ | ---- | ------ | ------------------------- |
| `keyword`      | string                         | ✅   | -      | 검색할 주소 키워드        |
| `currentPage`  | string                         | ❌   | "1"    | 현재 페이지 번호          |
| `countPerPage` | string                         | ❌   | "10"   | 페이지당 결과 수          |
| `resultType`   | 'xml' \| 'json'                | ❌   | "json" | 응답 형식                 |
| `hstryYn`      | 'Y' \| 'N'                     | ❌   | "N"    | 변동된 주소정보 포함 여부 |
| `firstSort`    | 'none' \| 'road' \| 'location' | ❌   | "none" | 정렬 우선순위             |
| `addInfoYn`    | 'Y' \| 'N'                     | ❌   | "N"    | 추가 정보 포함 여부       |

## 응답 형식

### 성공 응답

```json
{
  "results": {
    "common": {
      "totalCount": "150",
      "currentPage": "1",
      "countPerPage": "10",
      "errorCode": "0",
      "errorMessage": "정상"
    },
    "juso": [
      {
        "roadAddr": "서울특별시 강남구 강남대로 396",
        "roadAddrPart1": "서울특별시 강남구 강남대로 396",
        "roadAddrPart2": "",
        "jibunAddr": "서울특별시 강남구 역삼동 737-8",
        "engAddr": "396, Gangnam-daero, Gangnam-gu, Seoul, Republic of Korea",
        "zipNo": "06123",
        "admCd": "1168010300",
        "rnMgtSn": "1168010300",
        "bdMgtSn": "1168010300",
        "detBdNmList": "",
        "bdNm": "",
        "bdKdcd": "0",
        "siNm": "서울특별시",
        "sggNm": "강남구",
        "emdNm": "역삼동",
        "liNm": "",
        "rn": "강남대로",
        "udrtYn": "0",
        "buldMnnm": "396",
        "buldSlno": "0",
        "mtYn": "0",
        "lnbrMnnm": "737",
        "lnbrSlno": "8",
        "emdNo": "00"
      }
    ]
  }
}
```

### 에러 응답

```json
{
  "error": "주소 검색에 실패했습니다.",
  "details": "검색어를 입력해주세요."
}
```

## 환경 변수

프로젝트 루트에 `.env.local` 파일을 생성하고 다음을 추가하세요:

```env
JUSO_API_KEY=your_actual_api_key_here
```

## 주의사항

1. **API 키 보안**: `JUSO_API_KEY`는 서버 사이드에서만 사용되어야 합니다.
2. **요청 제한**: 도로명주소 API의 요청 제한을 확인하세요.
3. **에러 처리**: API 응답의 `errorCode`를 확인하여 적절한 에러 처리를 구현하세요.

## 도로명주소 API 문서

자세한 내용은 [도로명주소 개발자센터](https://business.juso.go.kr/addrlink/openApi/searchApi.do)를 참조하세요.
