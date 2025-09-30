'use client';

export default function CompareResultPage() {
  return (
    <div className='flex h-screen flex-col bg-white'>
      {/* Header */}
      <header className='flex items-center justify-between border-b border-gray-200 px-4 py-3'>
        <button className='text-xl'>✕</button>
        <h1 className='text-base font-bold'>비교 결과</h1>
        <button className='text-sm text-gray-700'>공유하기</button>
      </header>

      {/* Scroll 영역 */}
      <div className='flex-1 overflow-y-auto'>
        {/* 상단 유치원 선택 */}
        <div className='flex items-center justify-around px-4 py-3'>
          <div className='flex flex-col items-center'>
            <div className='h-12 w-12 rounded-full bg-gray-300' />
            <p className='mt-1 text-sm font-semibold'>강아지 유치원 A</p>
            <p className='text-xs text-gray-500'>유치원 · 호텔</p>
          </div>
          <div className='flex flex-col items-center'>
            <div className='h-12 w-12 rounded-full bg-gray-300' />
            <p className='mt-1 text-sm font-semibold'>스타동 강아지…</p>
            <p className='text-xs text-gray-500'>유치원 · 호텔</p>
          </div>
        </div>

        {/* 탭 */}
        <div className='flex border-b border-gray-200'>
          <button className='flex-1 py-2 text-center text-sm text-gray-500'>요약</button>
          <button className='flex-1 border-b-2 border-orange-500 py-2 text-center text-sm font-semibold text-orange-500'>
            자세히
          </button>
        </div>

        {/* 요금 비교 */}
        <section className='px-4 py-6'>
          <h2 className='mb-3 text-base font-bold'>요금 비교</h2>
          <div className='mb-2 flex justify-between'>
            <span className='font-semibold'>약 30,000원</span>
            <span className='font-semibold'>약 25,000원</span>
          </div>
          <div className='mb-2 flex justify-between text-sm text-gray-500'>
            <span>상품명</span>
            <span>상품명</span>
          </div>
          {/* … 생략 (횟수권/정기권 라인) */}
        </section>

        {/* 강아지 서비스 비교 */}
        <section className='px-4 py-6'>
          <h2 className='mb-3 text-base font-bold'>강아지 서비스 비교</h2>
          <div className='rounded-lg border border-gray-200 p-4'>
            <p className='mb-2 text-sm font-semibold'>단독 제공</p>
            <div className='flex flex-wrap gap-3 text-sm'>
              <span>🏡 루프탑</span>
              <span>✂️ 미용</span>
            </div>
          </div>
          <div className='mt-4 rounded-lg border border-gray-200 p-4'>
            <p className='mb-2 text-sm font-semibold'>공통</p>
            <div className='flex flex-wrap gap-3 text-sm'>
              <span>🐶 소형견 전용</span>
              <span>🚿 목욕</span>
              <span>🎥 CCTV</span>
            </div>
          </div>
        </section>

        {/* 거리 비교 */}
        <section className='px-4 py-6'>
          <h2 className='mb-3 text-base font-bold'>거리 비교</h2>
          <div className='mb-2 flex justify-between text-sm'>
            <span>도보 5분</span>
            <span>도보 7분</span>
          </div>
          <div className='mb-2 flex justify-between text-sm'>
            <span>대중교통 12분</span>
            <span>대중교통 15분</span>
          </div>
          <div className='mb-2 flex justify-between text-sm'>
            <span>차량 5분</span>
            <span>차량 7분</span>
          </div>
          <div className='flex justify-between text-sm'>
            <span>거리 1.2km</span>
            <span>거리 1.5km</span>
          </div>
        </section>

        {/* 운영 시간 비교 */}
        <section className='px-4 py-6'>
          <h2 className='mb-3 text-base font-bold'>운영 시간 비교</h2>
          <div className='mb-2 flex justify-between text-sm'>
            <span>평일 10:00~19:00</span>
            <span>평일 09:00~18:00</span>
          </div>
          <div className='mb-2 flex justify-between text-sm'>
            <span>주말 -</span>
            <span>주말 09:00~18:00</span>
          </div>
          <div className='flex justify-between text-sm'>
            <span>공휴일 휴무</span>
            <span>공휴일 일요일, 공휴일</span>
          </div>
        </section>
      </div>
    </div>
  );
}
