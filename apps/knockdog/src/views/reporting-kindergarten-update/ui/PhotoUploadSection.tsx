import { PhotoUploader } from '@shared/ui/photo-uploader';

interface PhotoUploadSectionProps {
  maxCount: number;
  onChange: (files: File[]) => void;
}

export function PhotoUploadSection({ maxCount, onChange }: PhotoUploadSectionProps) {
  return (
    <div className='mt-5 px-4'>
      <PhotoUploader maxCount={maxCount} onChange={(items) => onChange(items.map((it) => it.file))} />
    </div>
  );
}
