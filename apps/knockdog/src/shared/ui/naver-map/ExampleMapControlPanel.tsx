import { useCurrentLocation, useNaverMap } from '@knockdog/naver-map';

export const ExampleMapControlPanel = () => {
  const { moveTo, zoomIn, zoomOut } = useNaverMap();
  const currentLocation = useCurrentLocation();

  const handleMoveToCurrentLocation = () => {
    if (!currentLocation) return;
    moveTo(currentLocation);
  };

  const handleZoomIn = () => zoomIn();
  const handleZoomOut = () => zoomOut();

  return (
    <div className='absolute bottom-8 right-4 flex flex-col gap-1'>
      <button
        className='rounded-md border border-gray-700 bg-white px-2 py-1 text-sm text-gray-800'
        onClick={handleZoomIn}
      >
        줌 인
      </button>
      <button
        className='rounded-md border border-gray-700 bg-white px-2 py-1 text-sm text-gray-800'
        onClick={handleZoomOut}
      >
        줌 아웃
      </button>

      <button
        className='rounded-md border border-gray-700 bg-white px-2 py-1 text-sm text-gray-800'
        onClick={handleMoveToCurrentLocation}
      >
        현재 위치
      </button>
    </div>
  );
};
