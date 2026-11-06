/** constants */
export {
  CTAG_MAP,
  PRODUCT_TYPE,
  TRANSPORTATION_TYPE,
  TRANSPORTATION_ICON_MAP,
  REFERENCE_POINT_TYPE,
  DAY_OF_WEEK_SHORT,
  CLOSED_DAYS,
} from './model/constants/compare';

/** config */
export {
  comparisonsQueryKeys,
  createComparisonsQueryOptions,
  createComparisonHistoryQueryOptions,
} from './config/comparisonsQueryKeys';

/** lib */
export { parseTimeStrToMinutes, parseMinutesToTimeStr, getClosedDaysText } from './lib/formatters';
export { resolveIds, resolveCoords, s3ToUrl, mapToSimpleItem, getProduct, getTransitTime, getDistanceString } from './lib/utils';
export { serializeCategories } from './lib/serialize';
export { isSelectedIds } from './lib/is';

/** model */
export type {
  SelectedIds,
  KindergartenComparison,
  CTag,
  ProductType,
  ReferencePointType,
  TransportationType,
  DayOfWeekShort,
  SimpleComparisonItem,
  DetailComparisonItem,
  PriceDetailComparison,
  DistanceComparisonsByTransport,
  DistanceDetailComparison,
  ShortestInfo,
  CellData,
  RowData,
  SlideProps,
  TableProps,
  KindergartenShortInfo,
} from './model/types';

/** api */
export { deleteComparisonHistory } from './api/comparisons';
export type { ComparisonHistoryItem } from './api/comparisons';

/** ui */
export { Summary } from './ui/Summary';
export { Description } from './ui/Description';
export { Detail } from './ui/Detail';
export { CircleAvatar } from './ui/CircleAvatar';
export { StackedCircleAvatars } from './ui/StackedCircleAvatars';
export { Label } from './ui/Label';
export { Badge } from './ui/Badge';
export { SelectedCell } from './ui/SelectedCell';
