import Image from 'next/image';

import { formatInquiryDateTime, InquiryImageScroller, type InquiryDetailMessageDto } from '@entities/inquiry';

interface InquiryMessageItemProps {
  message: InquiryDetailMessageDto;
}

/** 사용자 문의: 내용, 첨부 사진(가로 나열), 작성 일시 */
function InquiryUserMessage({ message }: InquiryMessageItemProps) {
  const images = [...message.images].sort((first, second) => first.displayOrder - second.displayOrder);

  return (
    <div className='gap-x3 px-x4 py-x3 flex flex-col'>
      <div className='gap-x2 flex flex-col'>
        <p className='body1-regular text-text-primary break-words whitespace-pre-wrap'>{message.body}</p>
        {images.length > 0 ? (
          <InquiryImageScroller>
            {images.map((image) => (
              // eslint-disable-next-line @next/next/no-img-element -- 서버 사진 미리보기. 확대 보기는 범위 밖 (PRD 7.2)
              <img
                key={image.id}
                src={image.imageUrl}
                alt=''
                draggable={false}
                className='radius-r3 bg-line-200 size-24 shrink-0 object-cover'
              />
            ))}
          </InquiryImageScroller>
        ) : null}
      </div>
      <p className='label-medium text-fill-secondary-500'>{formatInquiryDateTime(message.createdAt)}</p>
    </div>
  );
}

/** 운영자 답변: 똑독 로고와 작성 일시, 답변 내용을 회색 카드로 */
function InquiryOperatorMessage({ message }: InquiryMessageItemProps) {
  return (
    <div className='px-x4 py-x3'>
      <div className='bg-bg-50 radius-r4 gap-x3 p-x4 flex flex-col'>
        <div className='flex items-center justify-between'>
          <Image src='/images/img_logo_text2.png' alt='똑독' width={37} height={20} />
          <p className='label-medium text-fill-secondary-500'>{formatInquiryDateTime(message.createdAt)}</p>
        </div>
        <p className='body1-regular text-text-primary break-words whitespace-pre-wrap'>{message.body}</p>
      </div>
    </div>
  );
}

/** 작성 주체에 따라 사용자 문의 또는 운영자 답변으로 보여준다 */
function InquiryMessageItem({ message }: InquiryMessageItemProps) {
  return message.sender === 'OPERATOR' ? (
    <InquiryOperatorMessage message={message} />
  ) : (
    <InquiryUserMessage message={message} />
  );
}

export { InquiryMessageItem };
