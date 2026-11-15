import { useCallback, useState } from 'react';
import { useSearchParams } from 'next/navigation';

import {
  OWNER_DAILY_QUERY_KEY,
  parseOwnerDailyDateParam,
  parseOwnerDailyLateOnlyParam,
  parseOwnerDailyTabParam,
  parseOwnerDailyFilterParam,
} from '@views/owner-daily-page/lib/ownerDailyUrlState';

/** 값이 null인 항목은 주소에서 지운다. */
type OwnerDailyUrlPatch = Partial<
  Record<(typeof OWNER_DAILY_QUERY_KEY)[keyof typeof OWNER_DAILY_QUERY_KEY], string | null>
>;

/** 지금 주소의 query에 patch를 합쳐 기록 없이(replace) 바꾼다. 홈 진입용 `from` 등 다른 값은 그대로 둔다. */
const replaceUrlQuery = (patch: OwnerDailyUrlPatch) => {
  const params = new URLSearchParams(window.location.search);
  Object.entries(patch).forEach(([key, value]) => {
    if (value === null || value === undefined) params.delete(key);
    else params.set(key, value);
  });
  const queryString = params.toString();

  // Next의 useSearchParams와 연동되는 기본 History API. 서버 요청 없이 주소만 바꾼다.
  window.history.replaceState(
    null,
    '',
    `${window.location.pathname}${queryString ? `?${queryString}` : ''}${window.location.hash}`
  );
};

/**
 * 일과 화면의 날짜·탭·필터·검색어를 주소 query에서 읽고 쓴다. 주소가 유일한 기준이라서,
 * 뒤로가기로 돌아오거나 홈·알림이 새 query로 열어도 그 값 그대로 화면에 반영된다.
 * - 주소에 없는 값은 기본값(오늘·날짜별 기본 탭·`전체`·지각 끔·빈 검색어)이다.
 * - 이상한 값(없는 날짜, 모르는 탭 이름 등)은 없는 것으로 본다. 날짜 범위 검사는 호출하는 쪽에서 한다.
 * - 검색어는 입력창이 주소 갱신을 기다리다 글자가 끊기지 않도록 화면 안에 입력값을 두고 주소에 복사한다.
 *   주소가 우리가 쓴 값이 아닌 값으로 바뀌면(홈·알림 진입, 뒤로가기) 입력값이 주소를 따라간다.
 */
const useOwnerDailyUrlState = () => {
  const searchParams = useSearchParams();
  const urlKeyword = searchParams.get(OWNER_DAILY_QUERY_KEY.keyword) ?? '';
  const [keyword, setKeywordState] = useState(urlKeyword);
  // 우리가 주소에 쓰고 아직 주소 쪽에서 돌아오지 않은 검색어. 늦게 도착한 중간 값이 입력값을 되돌리지 않게 거른다.
  const [pendingOwnKeywords, setPendingOwnKeywords] = useState<string[]>([]);
  const [syncedUrlKeyword, setSyncedUrlKeyword] = useState(urlKeyword);

  // 주소의 검색어가 바뀌면, 우리가 쓴 값이 돌아온 것은 넘기고 그 밖의 값(홈·알림 진입, 뒤로가기)은 입력값에 반영한다.
  if (urlKeyword !== syncedUrlKeyword) {
    setSyncedUrlKeyword(urlKeyword);
    const ownKeywordIndex = pendingOwnKeywords.indexOf(urlKeyword);
    if (ownKeywordIndex !== -1) {
      setPendingOwnKeywords(pendingOwnKeywords.slice(ownKeywordIndex + 1));
    } else {
      setPendingOwnKeywords([]);
      setKeywordState(urlKeyword);
    }
  }

  /** 검색어를 입력값과 주소에 함께 반영한다. */
  const setKeyword = useCallback((nextKeyword: string) => {
    setKeywordState(nextKeyword);

    const currentKeyword = new URLSearchParams(window.location.search).get(OWNER_DAILY_QUERY_KEY.keyword) ?? '';
    if (currentKeyword === nextKeyword) return;

    setPendingOwnKeywords((pending) => [...pending, nextKeyword]);
    replaceUrlQuery({ [OWNER_DAILY_QUERY_KEY.keyword]: nextKeyword || null });
  }, []);

  return {
    dateParam: parseOwnerDailyDateParam(searchParams.get(OWNER_DAILY_QUERY_KEY.date)),
    tab: parseOwnerDailyTabParam(searchParams.get(OWNER_DAILY_QUERY_KEY.tab)),
    lateOnly: parseOwnerDailyLateOnlyParam(searchParams.get(OWNER_DAILY_QUERY_KEY.lateOnly)),
    todayFilter: parseOwnerDailyFilterParam(searchParams.get(OWNER_DAILY_QUERY_KEY.todayFilter)),
    keyword,
    setKeyword,
    replaceUrlQuery,
  };
};

export { useOwnerDailyUrlState };
