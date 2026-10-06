import { useParams } from 'next/navigation';
import { Icon } from '@knockdog/ui';
import { ProductTypeSection, PriceImageSlider, usePricingQuery } from '@features/pricing';
import { useCallPhone } from '@shared/lib/device';
import { useStackNavigation } from '@shared/lib/bridge';

interface PricingSectionProps {
  kindergartenId?: string;
}

function PricingSection({ kindergartenId }: PricingSectionProps) {
  const params = useParams<{ id: string }>();
  const id = kindergartenId ?? params?.id;
  const { push } = useStackNavigation();

  if (!id) throw new Error('Company ID is required for pricing section');

  const callPhone = useCallPhone();

  const { data: pricing } = usePricingQuery(id);

  return (
    <div className='mt-8 mb-12 flex flex-col gap-12 px-4'>
      {/* 상품유형 */}
      <ProductTypeSection productType={pricing?.productType ?? []} />

      {/* 서비스 및 이용요금 */}
      <div>
        <div className='mb-1'>
          <span className='body1-extrabold'>서비스 및 이용요금</span>
        </div>
        <div className='flex flex-col gap-5'>
          <div className='flex items-center justify-between gap-x2'>
            <span className='body2-regular text-text-tertiary'>자세한 내용은 업체로 문의 바랍니다.</span>
            <button
              onClick={() => callPhone(pricing?.phoneNumber ?? '')}
              className='body2-bold text-text-accent flex h-x5 w-[73px] shrink-0 items-center gap-x1'
            >
              <Icon icon='Call' className='text-fill-primary-500 size-x5 shrink-0' />
              전화하기
            </button>
          </div>

          {pricing?.productCategories.map((category) => (
            <div key={category.productName}>
              <span className='body1-bold mb-3 inline-block'>{category.productName}</span>

              <div className='bg-primitive-neutral-50 flex flex-col gap-3 rounded-lg p-4'>
                {category.products.map((product, index) => (
                  <div className='grid grid-cols-3' key={`${product.name}-${index}`}>
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
      <PriceImageSlider images={pricing?.priceImages ?? []} />
      {/* 최종 정보 업데이트 */}
      <div className='flex items-center justify-between py-4'>
        <div className='flex flex-col'>
          <span className='body1-bold'>최종 정보 업데이트</span>
          <span className='body2-regular text-text-tertiary'>{pricing?.lastUpdatedAt}</span>
        </div>
        <div>
          <button
            onClick={() => push({ pathname: `/kindergarten/${id}/report-info-update` })}
            className='body2-bold text-text-accent mx-auto flex h-x5 w-[104px] items-center justify-center text-center underline'
          >
            정보와 달라요
          </button>
        </div>
      </div>
    </div>
  );
}

export { PricingSection };
