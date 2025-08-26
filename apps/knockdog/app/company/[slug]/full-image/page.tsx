import { FullImageSlider } from '@widgets/full-image-slider';

export default function Page() {
  const images = [
    'https://images.unsplash.com/photo-1518717758536-85ae29035b6d',
    'https://images.unsplash.com/photo-1548199973-03cce0bbc87b', // 가로형 강아지 이미지
    'https://images.unsplash.com/photo-1587300003388-59208cc962cb', // 가로형 강아지 이미지
    'https://images.unsplash.com/photo-1552053831-71594a27632d', // 가로형 강아지 이미지
    'https://images.unsplash.com/photo-1583511655857-d19b40a7a54e', // 가로형 강아지 이미지
  ];
  return (
    <div>
      <FullImageSlider initialIndex={3} images={images} />
    </div>
  );
}
