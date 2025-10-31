interface WebSiteInfoProps {
  website?: string;
  instagram?: string;
  youtube?: string;
}

interface LinkRowProps {
  label: string;
  value?: string;
}

const LINK_CONFIGS = [
  { key: 'website' as const, label: '홈페이지' },
  { key: 'instagram' as const, label: '인스타그램' },
  { key: 'youtube' as const, label: '유튜브' },
] as const;

function LinkRow({ label, value }: LinkRowProps) {
  return (
    <div className='flex'>
      <dt className='body2-bold text-text-tertiary mr-3 min-w-[76px] flex-shrink-0'>{label}</dt>
      <dd className='body2-regular overflow-wrap-anywhere flex-1 break-all'>
        {value ? <span className='underline'>{value}</span> : <span className='text-text-secondary'>정보 없음</span>}
      </dd>
    </div>
  );
}

function NoDataMessage() {
  return (
    <span className='body2-regular text-text-primary'>
      등록된 정보가 없습니다. <br />
      자세한 내용은 업체로 직접 문의해 주세요
    </span>
  );
}

function ExternalLinksCard({ website, instagram, youtube }: WebSiteInfoProps) {
  const links = { website, instagram, youtube };
  const hasAnyLink = Object.values(links).some(Boolean);

  return (
    <div>
      <div className='mb-3'>
        <span className='body1-bold'>웹사이트·SNS</span>
      </div>
      <dl className='bg-primitive-neutral-50 flex flex-col gap-4 rounded-lg p-4'>
        {!hasAnyLink ? (
          <NoDataMessage />
        ) : (
          LINK_CONFIGS.map(({ key, label }) => <LinkRow key={key} label={label} value={links[key]} />)
        )}
      </dl>
    </div>
  );
}

export { ExternalLinksCard };
