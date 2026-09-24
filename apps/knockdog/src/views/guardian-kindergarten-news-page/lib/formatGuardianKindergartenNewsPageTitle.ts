import { GUARDIAN_KINDERGARTEN_NEWS_TITLE_NAME_MAX } from '@views/guardian-kindergarten-news-page/model/guardianKindergartenNews';
import { guardianKindergartenNewsContent } from '@views/guardian-kindergarten-news-page/config/guardianKindergartenNewsContent';

/** `{유치원명(최대 10자)…} 소식` */
function formatGuardianKindergartenNewsPageTitle(kindergartenName: string | null | undefined) {
  if (!kindergartenName) return guardianKindergartenNewsContent.pageTitleFallback;

  const truncated =
    kindergartenName.length > GUARDIAN_KINDERGARTEN_NEWS_TITLE_NAME_MAX
      ? `${kindergartenName.slice(0, GUARDIAN_KINDERGARTEN_NEWS_TITLE_NAME_MAX)}...`
      : kindergartenName;

  return `${truncated}${guardianKindergartenNewsContent.pageTitleSuffix}`;
}

export { formatGuardianKindergartenNewsPageTitle };
