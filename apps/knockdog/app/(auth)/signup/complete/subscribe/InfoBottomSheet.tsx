import React from 'react';
import { BottomSheet, Icon } from '@knockdog/ui';

interface InfoBottomSheetProps {
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
}

export default function InfoBottomSheet({
  isOpen,
  onOpenChange,
}: InfoBottomSheetProps) {
  return (
    <BottomSheet.Root open={isOpen} onOpenChange={onOpenChange}>
      <BottomSheet.Content>
        <BottomSheet.Handle />
        <BottomSheet.Header className='border-line-200 justify-between border-b'>
          <BottomSheet.Title>마케팅 정보 수신 동의</BottomSheet.Title>
          <BottomSheet.Close className='absolute right-4 flex items-center justify-center'>
            <Icon icon='Close' />
          </BottomSheet.Close>
        </BottomSheet.Header>
        <div className='px-6 py-4'>
          <p className='body2-regular text-text-secondary whitespace-pre-line'>
            {
              '"똑독(주)"(이하 "회사")는 「정보통신망 이용촉진 및 정보보호 등에 관한 법률」, 「개인정보 보호법」 등 관계 법령에 따라 광고성 정보를 전송하기 위해 수신자의 사전 수신 동의를 받고 있으며, 광고성 정보 수신자의 수신 동의 여부를 정기적으로 확인합니다. 다만 동의하지 않을 경우, 서비스 및 상품 소개, 혜택 안내, 이벤트 정보 제공 등 목적에 따른 혜택에 제한이 있을 수 있습니다.\n\n01. 목적\n앱 푸시, 문자메시지(알림톡), 이메일을 통한 광고성 정보 전송\n똑독 및 제휴 서비스의 소식, 혜택, 이벤트, 광고 등 마케팅 활용\n똑독 서비스 이용에 따른 정보성 알림은 수신 동의 여부와 무관하게 제공됩니다.\n\n02. 이용 항목\n휴대폰번호, 이메일주소\n\n03. 보유 및 이용 기간\n마케팅 활용 동의일로부터 똑독 서비스 탈퇴 또는 동의 철회 시까지\n\n※ 본 동의는 선택 동의로서, 거부하시더라도 서비스 이용에는 제한이 없습니다.\n※ 마케팅 정보 수신 동의/해제는 언제든지 앱의 설정 메뉴에서 변경하실 수 있습니다. (똑독 앱 내: 마이페이지 > 알림 설정 > 마케팅 수신 동의)'
            }
          </p>
        </div>
      </BottomSheet.Content>
    </BottomSheet.Root>
  );
}
