/** API 평점 연결 전 목록·상세 화면에 사용하는 리뷰 표시 */
export function ReviewRating() {
  return (
    <div className='flex h-x5 shrink-0 items-center'>
      <svg className='size-x5 shrink-0' viewBox='0 0 20 20' fill='none' aria-hidden='true'>
        <path
          d='M10 1.875L12.305 6.547L17.461 7.296L13.73 10.933L14.61 16.068L10 13.645L5.39 16.068L6.27 10.933L2.539 7.296L7.695 6.547L10 1.875Z'
          fill='#FF6E0C'
        />
      </svg>
      <span className='body2-bold text-text-primary'>4.2</span>
      <span className='body2-semibold text-text-tertiary whitespace-nowrap'>(9,999개)</span>
    </div>
  );
}
