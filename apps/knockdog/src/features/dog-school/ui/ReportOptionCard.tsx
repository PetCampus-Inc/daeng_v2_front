import { Checkbox } from '@knockdog/ui';

interface ReportOptionCardProps {
  checked: boolean;
  title: string;
  description: string;
  onCheckedChange: (checked: boolean) => void;
  children?: React.ReactNode;
}

export function ReportOptionCard(props: ReportOptionCardProps) {
  const { checked, title, description, onCheckedChange, children } = props;
  return (
    <div className='flex flex-col p-4 last:pb-10'>
      <div className='flex gap-2'>
        <Checkbox checked={checked} onCheckedChange={(v) => onCheckedChange(Boolean(v))}>
          <div className='flex flex-col'>
            <span className='body1-extrabold'>{title}</span>
            <span className='body2-regular text-text-tertiary'>{description}</span>
          </div>
        </Checkbox>
      </div>
      {checked && children}
    </div>
  );
}
