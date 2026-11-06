import type { KindergartenComparison, ProductType, SlideProps } from '@entities/compare';
import { getProduct, PRODUCT_TYPE } from '@entities/compare';

export function createPricingSlides(
  left: KindergartenComparison | null,
  right: KindergartenComparison | null
): SlideProps[] {
  return Object.entries(PRODUCT_TYPE).map(([prodType, prodTypeLabel]) => {
    const leftProduct = getProduct(left, prodType as ProductType);
    const rightProduct = getProduct(right, prodType as ProductType);

    const leftMin = leftProduct?.min?.price;
    const leftMax = leftProduct?.max?.price;
    const leftCountHourly = leftProduct?.countTicketAvg;
    const leftMonthlyHourly = leftProduct?.monthlyHourlyAvg;

    const rightMin = rightProduct?.min?.price;
    const rightMax = rightProduct?.max?.price;
    const rightCountHourly = rightProduct?.countTicketAvg;
    const rightMonthlyHourly = rightProduct?.monthlyHourlyAvg;

    const baseRows = [
      {
        label: '최저가',
        left: {
          value: leftMin ? `약 ${leftMin.toLocaleString()}원` : '-',
          detail: leftProduct?.min?.name,
        },
        right: {
          value: rightMin ? `약 ${rightMin.toLocaleString()}원` : '-',
          detail: rightProduct?.min?.name,
        },
      },
      {
        label: '최대가',
        left: {
          value: leftMax ? `약 ${leftMax.toLocaleString()}원` : '-',
          detail: leftProduct?.max?.name,
        },
        right: {
          value: rightMax ? `약 ${rightMax.toLocaleString()}원` : '-',
          detail: rightProduct?.max?.name,
        },
      },
    ];

    const ticketRows =
      prodType !== 'MEMBERSHIP'
        ? [
            {
              label: '횟수권\n(1h)',
              left: { value: leftCountHourly ? `${leftCountHourly.toLocaleString()}원` : '-' },
              right: { value: rightCountHourly ? `${rightCountHourly.toLocaleString()}원` : '-' },
            },
            {
              label: '정기권\n(1h)',
              left: { value: leftMonthlyHourly ? `${leftMonthlyHourly.toLocaleString()}원` : '-' },
              right: {
                value: rightMonthlyHourly ? `${rightMonthlyHourly.toLocaleString()}원` : '-',
              },
            },
          ]
        : [];

    return {
      type: prodTypeLabel,
      rows: [...baseRows, ...ticketRows],
    };
  });
}
