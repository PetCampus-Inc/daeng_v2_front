import aiSpark from './ai-spark.svg';

const toAssetSrc = (asset: string | { src: string }) => {
  return typeof asset === 'string' ? asset : asset.src;
};

const AiWrittenBadge = () => {
  return (
    <span className='bg-fill-secondary-50 caption1-semibold text-text-tertiary rounded-r2 px-x2 inline-flex items-center justify-center gap-0.5 py-[6px] whitespace-nowrap'>
      <img src={toAssetSrc(aiSpark)} alt='' width={16} height={16} />
      AI가 작성
    </span>
  );
};

export { AiWrittenBadge };
