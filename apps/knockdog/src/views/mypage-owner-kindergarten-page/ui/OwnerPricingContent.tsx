'use client';

import { ProductTypeSection, PriceImageSlider, usePricingQuery } from '@features/pricing';
import { ownerMypageContent } from '@features/role-conversion';
import type { ProductType } from '@entities/pricing';

interface OwnerPricingContentProps {
  /** placeId. 없으면 MANUAL/미확인 empty UI */
  kindergartenId?: string;
}

function OwnerPricingContent({ kindergartenId }: OwnerPricingContentProps) {
  const { data: pricing } = usePricingQuery(kindergartenId ?? '', {
    enabled: Boolean(kindergartenId),
  });

  const productType: ProductType[] = pricing?.productType ?? [];
  const productCategories = pricing?.productCategories ?? [];
  const priceImages = pricing?.priceImages ?? [];
  const lastUpdatedAt = pricing?.lastUpdatedAt;
  const hasPriceImages = priceImages.length > 0;
  const hasProductCategories = productCategories.length > 0;

  return (
    <div className='flex flex-col gap-5 px-4 pt-5 pb-4'>
      <ProductTypeSection
        productType={productType}
        title={ownerMypageContent.kindergartenPricingProductTypeTitle}
      />

      {hasPriceImages ? (
        <PriceImageSlider images={priceImages} thumbnailSize={80} />
      ) : (
        <div className='flex flex-col gap-4'>
          <span className='body1-bold text-text-primary'>
            {ownerMypageContent.kindergartenPricingPriceListTitle}
          </span>
          <p className='body2-semibold text-text-secondary'>
            {ownerMypageContent.kindergartenPricingPriceListEmptyText}
          </p>
        </div>
      )}

      <div className='flex flex-col gap-4'>
        <span className='body1-bold text-text-primary'>
          {ownerMypageContent.kindergartenPricingServiceTitle}
        </span>

        {hasProductCategories ? (
          productCategories.map((category) => (
            <div key={category.productName} className='flex flex-col gap-4'>
              <span className='body1-bold text-text-primary'>{category.productName}</span>

              <div className='bg-fill-secondary-50 flex flex-col gap-3 rounded-lg p-4'>
                {category.products.map((product, index) => (
                  <div
                    className='body2-regular text-text-primary grid grid-cols-3'
                    key={`${category.productName}-${product.weightSection}-${product.count}-${index}`}
                  >
                    <span className='body2-semibold truncate text-left'>
                      {product.weightSection || product.name || ''}
                    </span>
                    <span className='truncate text-center'>{product.count}</span>
                    <span className='truncate text-right'>{product.price}</span>
                  </div>
                ))}
              </div>
            </div>
          ))
        ) : (
          <p className='body2-semibold text-text-secondary'>
            {ownerMypageContent.kindergartenPricingServiceEmptyText}
          </p>
        )}
      </div>

      <div className='flex flex-col gap-0.5'>
        <span className='body1-bold text-text-primary'>
          {ownerMypageContent.kindergartenEditLastUpdatedTitle}
        </span>
        <span className='body2-regular text-text-tertiary'>
          {lastUpdatedAt || ownerMypageContent.noConfirmedInfoText}
        </span>
      </div>
    </div>
  );
}

export { OwnerPricingContent };
