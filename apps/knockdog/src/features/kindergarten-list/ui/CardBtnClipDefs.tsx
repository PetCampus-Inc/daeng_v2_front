interface CardBtnClipDefsProps {
  id: string;
}

export function CardBtnClipDefs({ id }: CardBtnClipDefsProps) {
  return (
    <svg width='0' height='0' className='absolute'>
      <defs>
        <clipPath id={`card-btn-${id}`} clipPathUnits='objectBoundingBox'>
          <path d='M0 0 H1 V1 H0.3 C0.1343 1 0 0.8657 0 0.7 V0 Z' />
        </clipPath>
      </defs>
    </svg>
  );
}
