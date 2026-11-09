import type { Metadata } from 'next';

import { OwnerPassTemplateFormPage } from '@views/owner-pass-template-page';

export const metadata: Metadata = {
  title: '이용권 등록',
  description: '자주 사용하는 이용권을 등록하는 화면이에요.',
};

export default function Page() {
  return <OwnerPassTemplateFormPage mode='create' />;
}
