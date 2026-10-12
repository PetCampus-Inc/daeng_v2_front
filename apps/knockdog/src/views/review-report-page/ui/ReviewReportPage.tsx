'use client';

import { ActionButton } from '@knockdog/ui';

import { Header } from '@widgets/Header';
import { useStackNavigation } from '@shared/lib/bridge';

const REPORT_REASONS = [
  '유치원과 관련 없는 내용이에요',
  '광고∙홍보성 내용이에요',
  '개인정보가 포함되어 있어요',
  '욕설∙비방∙차별 표현이 있어요',
  '허위 내용 또는 악의적인 내용이에요',
  '저작권 등 권리 침해가 있어요',
  '같은 내용이 반복돼요',
  '기타',
] as const;

const REPORTED_REVIEW_CONTENT =
  '선생님들이 강아지 성향을 잘 봐주시고 알림도 꼼꼼해서 안심하고 보내고 있어요. 처음 등원할 때 많이 긴장했는데 하루 일과를 사진으로 확인할 수 있어 마음이 놓였고, 산책 후 강아지 컨디션도 안정적이었습니다.';

function ReviewReportPage() {
  const { back } = useStackNavigation();

  return (
    <div className='bg-bg-0 flex h-full min-h-0 flex-1 flex-col'>
      <Header>
        <Header.BackButton
          onClick={() => {
            back();
          }}
        />
        <Header.Title>리뷰 신고하기</Header.Title>
      </Header>

      <div className='min-h-0 flex-1 overflow-y-auto'>
        <section className='flex flex-col gap-3 p-4'>
          <p className='body2-bold text-text-primary'>신고할 리뷰</p>
          <div className='bg-bg-100 radius-r4 flex flex-col gap-2 p-4'>
            <div className='flex items-center justify-between'>
              <span className='flex items-center gap-0.5'>
                {/* eslint-disable-next-line @next/next/no-img-element -- 별점 아이콘 원본 색 유지 */}
                <img src='/images/img_review_card_star.svg' alt='' className='size-4' />
                <span className='body2-bold text-fill-secondary-700'>1.0</span>
              </span>
              <span className='body2-regular text-text-tertiary'>2026. 09. 19</span>
            </div>
            <p className='body1-regular text-text-primary line-clamp-3'>{REPORTED_REVIEW_CONTENT}</p>
          </div>
        </section>

        <section className='flex flex-col gap-3 p-4'>
          <p className='body2-bold text-text-primary'>
            신고 사유를 선택해 주세요
            <span className='text-text-accent'> *</span>
          </p>
          <div className='flex flex-col gap-3'>
            {REPORT_REASONS.map((reason) => (
              <div
                key={reason}
                className='border-line-200 radius-r2 flex items-center gap-2 border px-4 py-[11px]'
              >
                {/* eslint-disable-next-line @next/next/no-img-element -- 미선택 라디오 원본 크기 유지 */}
                <img src='/images/img_review_report_radio.svg' alt='' width={24} height={24} />
                <p className='body1-medium text-text-primary min-w-0 flex-1'>{reason}</p>
              </div>
            ))}
          </div>
        </section>

        <section className='flex flex-col gap-2 px-4 py-3'>
          <p className='body2-bold text-text-primary flex items-center gap-0.5'>
            상세 내용
            <span className='caption1-semibold text-text-tertiary'>(선택)</span>
          </p>
          <div className='bg-bg-50 radius-r2 flex flex-col gap-8 px-4 py-3'>
            <p className='body1-regular text-text-tertiary'>
              신고하는 상세 이유를 입력하세요. 신고 사유 중 기타 선택 시 필수로 입력해 주세요.
            </p>
            <p className='body2-regular text-text-caption'>
              0<span>/1,000</span>
            </p>
          </div>
        </section>
      </div>

      <div className='bg-bg-0 shrink-0 p-4'>
        <ActionButton type='button' size='large' disabled>
          신고 접수
        </ActionButton>
      </div>
    </div>
  );
}

export { ReviewReportPage };
