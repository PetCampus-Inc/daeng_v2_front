/** 문의 내역이 없을 때의 빈 상태 */
function InquiryListEmpty() {
  return (
    <div className='px-x4 flex min-h-0 flex-1 flex-col items-center justify-center'>
      <div className='gap-x4 px-x8 flex w-full flex-col items-center'>
        {/* eslint-disable-next-line @next/next/no-img-element -- 빈 문의 내역 일러스트 SVG */}
        <img src='/images/img_empty_inquiry.svg' alt='' width={156} height={183} />
        <div className='gap-x1 flex w-full flex-col items-center text-center'>
          <p className='body1-bold text-text-primary w-full'>문의 내역이 없어요</p>
          <p className='body2-regular text-text-secondary w-full'>궁금한 점이 있다면 문의해 보세요</p>
        </div>
      </div>
    </div>
  );
}

export { InquiryListEmpty };
