interface CardClipDefsProps {
  id: string;
}

export function CardClipDefs({ id }: CardClipDefsProps) {
  return (
    <svg width='0' height='0' className='absolute'>
      <defs>
        <clipPath id={`card-image-${id}`} clipPathUnits='objectBoundingBox'>
          <path d='M0.855 0C0.872 0 0.888 0.027 0.888 0.06V0.139C0.888 0.172 0.905 0.199 0.922 0.199H0.967C0.984 0.199 1 0.226 1 0.259V0.941C1 0.974 0.984 1 0.967 1H0.034C0.015 1 0 0.974 0 0.941V0.06C0 0.027 0.015 0 0.034 0H0.855Z' />
        </clipPath>
      </defs>
    </svg>
  );
}
