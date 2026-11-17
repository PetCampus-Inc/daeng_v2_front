import type { Metadata } from 'next';

import { OwnerPassTemplateFormPage } from '@views/owner-pass-template-page';

export const metadata: Metadata = {
  title: '이용권 수정',
  description: '등록한 이용권을 수정하거나 삭제하는 화면이에요.',
};

export default function Page() {
  return <OwnerPassTemplateFormPage mode='edit' />;
}
