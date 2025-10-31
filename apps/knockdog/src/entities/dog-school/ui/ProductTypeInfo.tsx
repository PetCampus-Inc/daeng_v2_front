import { Icon } from '@knockdog/ui';
import { cn } from '@knockdog/ui/lib';
import type { ProductType } from '@entities/pricing';
import { PRODUCT_TYPE_MAP_LIST } from '@entities/pricing';

export function ProductTypeInfo({ productType }: { productType: ProductType[] }) {
  return (
    <div>
      <div className='mb-3'>
        <span className='body1-bold'>상품유형</span>
      </div>
      <div className='flex gap-3'>
        {PRODUCT_TYPE_MAP_LIST.map(({ code, name }) => (
          <div
            key={code}
            className={cn(
              'bg-primitive-neutral-50 body2-bold flex flex-1 items-center justify-center gap-1 rounded-lg px-4 py-2',
              productType.includes(code) ? 'text-text-primary' : 'text-text-tertiary'
            )}
          >
            <span>{name}</span>
            <Icon
              icon='CheckFill'
              className={cn('h-5 w-5', productType.includes(code) ? 'text-text-accent' : 'text-text-tertiary')}
            />
          </div>
        ))}
      </div>
    </div>
  );
}
