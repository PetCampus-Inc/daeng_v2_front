'use client';

import { BottomSheet, TicketOptionCard } from '@knockdog/ui';

import { memberTicketChargeContent } from '@views/owner/member-ticket-charge/config/memberTicketChargeContent';
import {
  CHARGE_PRESETS,
  chargePresetDetail,
  type ChargePreset,
} from '@views/owner/member-ticket-charge/model/memberTicketCharge';

interface TicketChargePresetSheetProps {
  isOpen: boolean;
  selectedId: string | null;
  onOpenChange: (isOpen: boolean) => void;
  onSelectDirect: () => void;
  onSelectPreset: (preset: ChargePreset) => void;
}

function TicketChargePresetSheet({
  isOpen,
  selectedId,
  onOpenChange,
  onSelectDirect,
  onSelectPreset,
}: TicketChargePresetSheetProps) {
  const { preset } = memberTicketChargeContent;

  return (
    <BottomSheet.Root open={isOpen} onOpenChange={onOpenChange} handleOnly>
      <BottomSheet.Overlay className='z-overlay' />
      <BottomSheet.Body className='z-modal flex max-h-[calc(100dvh-32px)] flex-col rounded-t-[20px]'>
        <BottomSheet.Handle />
        <BottomSheet.Header className='border-line-100 h-[54px] shrink-0 border-b px-6 py-[14px]'>
          <BottomSheet.Title>{preset.sheetTitle}</BottomSheet.Title>
          <BottomSheet.CloseButton />
        </BottomSheet.Header>
        <div className='flex flex-col gap-3 overflow-y-auto px-4 py-5'>
          <TicketOptionCard optionType='custom' title={preset.direct} selected={selectedId === null} onClick={onSelectDirect} />
          {CHARGE_PRESETS.map((item) => (
            <TicketOptionCard
              key={item.id}
              optionType='preset'
              title={item.name}
              description={chargePresetDetail(item)}
              selected={selectedId === item.id}
              onClick={() => onSelectPreset(item)}
            />
          ))}
        </div>
      </BottomSheet.Body>
    </BottomSheet.Root>
  );
}

export { TicketChargePresetSheet };
