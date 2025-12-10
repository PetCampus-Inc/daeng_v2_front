import { z } from 'zod';
import { Address } from '@entities/address';

const manualAddressSchema = z.object({
  address: z
    .object({
      pnu: z.string(),
      address: z.string(),
      roadAddress: z.string(),
      detail: z.string().optional(),
      lat: z.number(),
      lng: z.number(),
    })
    .optional()
    .refine((val) => val !== undefined, {
      message: '주소를 선택해주세요',
    }),
});

type ManualAddressFormState = z.infer<typeof manualAddressSchema>;

export { manualAddressSchema, type ManualAddressFormState };

