import Link from 'next/link';
import { useParams } from 'next/navigation';
import { ProductTypeSection, PriceImageSlider } from '@features/pricing';
import type { PricingInfo } from '@entities/pricing';
import { usePricingQuery } from '@features/pricing';

function PricingSection() {
  const params = useParams<{ id: string }>();
  const id = params?.id;

  if (!id) throw new Error('Company ID is required for pricing section');

  // const { data: pricing } = usePricingQuery(id);

  // @TODO API 완성 후 수정 필요
  const dogSchoolProductMock: PricingInfo = {
    productType: ['MEMBERSHIP', 'SUBSCRIPTION'],
    phoneNumber: '010-1234-5678',
    productCategories: [
      {
        productName: 'Aqua Dog Fitness',
        products: [{ name: '5회', price: 720000, count: '5회' }],
      },
      {
        productName: 'Private Personal Lesson',
        products: [{ name: '5회', price: 720000, count: '5회' }],
      },
      {
        productName: 'Private Group Lesson',
        products: [{ name: '5회', price: 720000, count: '5회' }],
      },
    ],
    priceImages: [
      'https://images.unsplash.com/photo-1518717758536-85ae29035b6d',
      'https://images.unsplash.com/photo-1518717758536-85ae29035b6d',
      'https://images.unsplash.com/photo-1518717758536-85ae29035b6d',
      'https://images.unsplash.com/photo-1518717758536-85ae29035b6d',
      'https://images.unsplash.com/photo-1518717758536-85ae29035b6d',
    ],
    lastUpdatedAt: '2025-04-29',
  };

  return (
    <div className='mb-12 mt-8 flex flex-col gap-12 px-4'>
      {/* 상품유형 */}
      <ProductTypeSection productType={dogSchoolProductMock.productType} />

      {/* 서비스 및 이용요금 */}
      <div>
        <div className='mb-1 flex items-center justify-between'>
          <span className='body1-bold'>서비스 및 이용요금</span>
          <a
            href={`tel:${dogSchoolProductMock.phoneNumber}`}
            className='body2-bold cursor-pointer text-neutral-500 hover:text-neutral-700'
          >
            전화걸기
          </a>
        </div>
        <div className='flex flex-col gap-5'>
          <span className='body2-regular text-text-tertiary'>자세한 내용은 업체로 문의 바랍니다.</span>

          {dogSchoolProductMock.productCategories.map((category) => (
            <div key={category.productName}>
              <span className='body1-bold mb-3 inline-block'>{category.productName}</span>

              <div className='bg-primitive-neutral-50 flex flex-col gap-3 rounded-lg p-4'>
                {category.products.map((product) => (
                  <div className='grid grid-cols-3' key={product.name}>
                    <span className='body2-semibold text-left'>{product.name || product.weightSection}</span>
                    <span className='body2-regular text-center'>{product.count}</span>
                    <span className='body2-regular text-right'>{product.price}</span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 가격표 */}
      <PriceImageSlider images={dogSchoolProductMock.priceImages} />
      {/* 최종 정보 업데이트 */}
      <div className='flex justify-between py-4'>
        <div className='flex flex-col'>
          <span className='body1-bold'>최종 정보 업데이트</span>
          <span className='body2-regular text-text-tertiary'>{dogSchoolProductMock.lastUpdatedAt}</span>
        </div>
        <div>
          <Link
            href={`/company/${id}/report-info-update`}
            className='text-text-accent caption2-semibold border-accent rounded-lg border px-3 py-2'
          >
            정보 수정 제보하기
          </Link>
        </div>
      </div>
    </div>
  );
}

export { PricingSection };
