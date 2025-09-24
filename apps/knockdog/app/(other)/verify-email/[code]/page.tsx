'use client';

import Image from 'next/image';
import { useVerifyEmail, VERIFICATION_STATUS } from '@entities/email-verification';

const CONTENT_MAP = {
  [VERIFICATION_STATUS.SUCCESS]: {
    title: '메일 인증 성공!',
    image: '/images/img_verify_email_success.png',
    description: (
      <p>
        해당 계정의 본인 인증이 완료되었습니다.
        <br />
        똑독으로 돌아가 다음 단계를 진행하세요.
      </p>
    ),
  },
  [VERIFICATION_STATUS.FAILED]: {
    title: 'IP 승인 링크 만료',
    image: '/images/img_verify_email_expired.png',
    description: '어플로 돌아가 다시 링크 요청을 전송하세요.',
  },
};

export default function VerifyEmail() {
  const { verificationStatus } = useVerifyEmail();

  if (verificationStatus === VERIFICATION_STATUS.PENDING) return null;

  const { title, description, image } = CONTENT_MAP[verificationStatus];

  return (
    <div className='h-screen pt-12'>
      <div className='flex w-full justify-center'>
        <div className='border-primitive-neutral-400 inline-flex flex-col items-center rounded-3xl border p-10 max-sm:border-transparent'>
          <Image src='/images/img_logo.png' alt='knockdog-logo' width={96} height={26} />

          <Image src={image} alt='knockdog-logo' width={200} height={200} className='mt-10' />

          <p className='h1-extrabold mt-12'>{title}</p>

          <div className='mt-2'>
            <p className='h3-medium'>{description}</p>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className='bg-primitive-neutral-800 fixed bottom-0 flex w-screen justify-between gap-4 p-10'>
        <div>
          <p className='h3-semibold text-white'>(주) 펫캠퍼스</p>

          <p className='text-text-secondary-inverse body2-regular mt-5'>
            <span>
              <strong>대표</strong> 최진영
            </span>
            <span className='bg-primitive-neutral-400 mx-1.5 inline-block h-2.5 w-px' />
            <span>
              <strong>사업자번호</strong> 181-04-02998
            </span>
            <span className='bg-primitive-neutral-400 mx-1.5 inline-block h-2.5 w-px' />
            <span>서울 성북구 길음동 숭인로 50, 119동 1003호</span>
          </p>

          <p className='text-text-secondary-inverse body2-regular mt-1'>Copyright ⓒ PetCampus. All Rights Reserved</p>
        </div>

        <div className='relative w-32'>
          <Image src='/images/img_footer_dog.png' alt='footer-dog-image' fill className='object-contain' />
        </div>
      </div>
    </div>
  );
}
