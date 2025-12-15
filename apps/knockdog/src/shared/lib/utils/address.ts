/**
 * 한국 주소에서 시/도, 시/군, 구까지 추출합니다.
 * @param address 전체 주소 (예: "서울특별시 광진구 능동로 49 2층")
 * @returns 시/도 + 시/군/구 (예: "서울 광진구")
 *
 * @example
 * getShortAddress("서울특별시 광진구 능동로 49 2층") // "서울 광진구"
 * getShortAddress("경기도 성남시 분당구 정자동 123") // "경기도 성남시 분당구"
 */
function getShortAddress(address: string): string {
  if (!address) {
    return '';
  }

  const parts = address.trim().split(' ');

  let firstPart = parts[0]; // 시/도 (특별시, 광역시, 특별자치시, 특별자치도, 도)
  if (!firstPart) {
    return '';
  }

  firstPart = firstPart.replace(/(특별시|광역시|특별자치시|특별자치도)$/, ''); // 예: "서울특별시" → "서울"

  const secondPart = parts[1]; // 시/군/구
  if (!secondPart) {
    return firstPart;
  }

  const thirdPart = parts[2]; // 구/동/읍/면

  if (!thirdPart) {
    return `${firstPart} ${secondPart}`;
  }

  // 시/군 + 구 조합인 경우 3단계까지 반환
  if ((secondPart.endsWith('시') || secondPart.endsWith('군')) && thirdPart.endsWith('구')) {
    return `${firstPart} ${secondPart} ${thirdPart}`; // 예: "경기도 성남시 분당구 정자동 123" → "경기도 성남시 분당구"
  }

  return `${firstPart} ${secondPart}`; // 예: "서울특별시 광진구 능동로 49 2층" → "서울 광진구"
}

export { getShortAddress };
