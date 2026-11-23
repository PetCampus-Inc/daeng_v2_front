'use client';

import Image from 'next/image';
import { overlay } from 'overlay-kit';

import { formatInquiryDateTime, InquiryImageScroller, type InquiryDetailMessageDto } from '@entities/inquiry';
import { useNativeBackToClose } from '@shared/lib/bridge';
import { ImageGalleryViewer } from '@shared/ui/image-gallery-viewer';

interface InquiryMessageItemProps {
  message: InquiryDetailMessageDto;
}

interface InquiryPhotoViewerProps {
  isOpen: boolean;
  close: () => void;
  images: string[];
  initialIndex: number;
}

/** 사진 보기가 열려 있는 동안 안드로이드 뒤로가기로 사진 보기만 닫는다. 공용 뷰어는 건드리지 않는다 */
const InquiryPhotoViewer = ({ isOpen, close, images, initialIndex }: InquiryPhotoViewerProps) => {
  useNativeBackToClose(isOpen, close);

  return (
    <ImageGalleryViewer
      isOpen={isOpen}
      close={close}
      images={images}
      initialIndex={initialIndex}
      ariaLabel='문의 첨부 사진 보기'
      native
      originalRatio
    />
  );
};

/** 사용자 문의: 내용, 첨부 사진(가로 나열), 작성 일시 */
function InquiryUserMessage({ message }: InquiryMessageItemProps) {
  const images = [...message.images].sort((first, second) => first.displayOrder - second.displayOrder);

  const openPhotoViewer = (initialIndex: number) => {
    overlay.open(({ isOpen, close }) => (
      <InquiryPhotoViewer
        isOpen={isOpen}
        close={close}
        images={images.map((image) => image.imageUrl)}
        initialIndex={initialIndex}
      />
    ));
  };

  return (
    <div className='gap-x3 px-x4 py-x3 flex flex-col'>
      <div className='gap-x2 flex flex-col'>
        <p className='body1-regular text-text-primary break-words whitespace-pre-wrap'>{message.body}</p>
        {images.length > 0 ? (
          <InquiryImageScroller>
            {images.map((image, index) => (
              <button
                key={image.id}
                type='button'
                aria-label={`${index + 1}번째 첨부 사진 크게 보기`}
                className='radius-r3 bg-line-200 size-24 shrink-0 overflow-hidden'
                onClick={() => openPhotoViewer(index)}
              >
                {/* eslint-disable-next-line @next/next/no-img-element -- 서버에서 받은 첨부 사진 URL을 직접 표시한다 */}
                <img src={image.imageUrl} alt='' draggable={false} className='size-full object-cover' />
              </button>
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
