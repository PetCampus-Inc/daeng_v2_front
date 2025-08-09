interface WebSiteInfoProps {
  website?: string;
  instagram?: string;
  youtube?: string;
}

function WebsiteRow({ website }: { website?: string }) {
  return (
    <div className='flex'>
      <dt className='body2-bold text-text-tertiary mr-3 min-w-[76px]'>
        홈페이지
      </dt>
      <dd className='body2-regular'>
        {website ? (
          <span className='underline'>{website}</span>
        ) : (
          <span className='text-text-secondary'>정보 없음</span>
        )}
      </dd>
    </div>
  );
}

function InstagramRow({ instagram }: { instagram?: string }) {
  return (
    <div className='flex'>
      <dt className='body2-bold text-text-tertiary mr-3 min-w-[76px]'>
        인스타그램
      </dt>
      <dd className='body2-regular'>
        {instagram ? (
          <span className='underline'>{instagram}</span>
        ) : (
          <span className='text-text-secondary'>정보 없음</span>
        )}
      </dd>
    </div>
  );
}

function YoutubeRow({ youtube }: { youtube?: string }) {
  return (
    <div className='flex'>
      <dt className='body2-bold text-text-tertiary mr-3 min-w-[76px]'>
        유튜브
      </dt>
      <dd className='body2-regular'>
        {youtube ? (
          <span className='underline'>{youtube}</span>
        ) : (
          <span className='text-text-secondary'>정보 없음</span>
        )}
      </dd>
    </div>
  );
}

function NoData() {
  return (
    <span className='body2-regular text-text-primary'>
      등록된 정보가 없습니다. <br />
      자세한 내용은 업체로 직접 문의해 주세요
    </span>
  );
}

export function WebSiteInfo({ website, instagram, youtube }: WebSiteInfoProps) {
  return (
    <div>
      <div className='mb-3'>
        <span className='body1-bold'>웹사이트·SNS</span>
      </div>
      <dl className='bg-primitive-neutral-50 flex flex-col gap-4 rounded-lg p-4'>
        {!website && !instagram && !youtube ? (
          <NoData />
        ) : (
          <>
            <WebsiteRow website={website} />
            <InstagramRow instagram={instagram} />
            <YoutubeRow youtube={youtube} />
          </>
        )}
      </dl>
    </div>
  );
}
