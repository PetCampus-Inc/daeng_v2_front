import { z } from 'zod';

const locationAddSchema = z.object({
  alias: z.string().optional(),
  address: z.object({
    address: z.string(),
    roadAddress: z.string(),
    detail: z.string().optional(),
    lat: z.number(),
    lng: z.number(),
  }),
});

type LocationAddFormState = z.infer<typeof locationAddSchema>;

export { locationAddSchema, type LocationAddFormState };
