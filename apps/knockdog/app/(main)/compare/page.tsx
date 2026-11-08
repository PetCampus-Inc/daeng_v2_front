import { redirect } from 'next/navigation';

import { route } from '@shared/constants/route';

export default function Page() {
  redirect(route.kindergarten.root);
}
