import type { LocationRPCSchema } from '../domains/location';
import type { NavigationRPCSchema } from '../domains/navigation';
import type { SafeAreaRPCSchema } from '../domains/safe-area';
import type { ToastRPCSchema } from '../domains/toast';
import type { AppVersionRPCSchema } from '../domains/app-version';
import type { SystemRPCSchema } from '../domains/system';
import type { MediaRPCSchema } from '../domains/media';
import type { AnalyticsRPCSchema } from '../domains/analytics';

type RPCSchema = LocationRPCSchema &
  NavigationRPCSchema &
  SafeAreaRPCSchema &
  SystemRPCSchema &
  ToastRPCSchema &
  AppVersionRPCSchema &
  MediaRPCSchema &
  AnalyticsRPCSchema;

type RPCMethod = keyof RPCSchema;
type ParamsOf<K extends RPCMethod> = RPCSchema[K] extends { params: infer P } ? P : never;
type ResultOf<K extends RPCMethod> = RPCSchema[K] extends { result: infer R } ? R : never;

export type { RPCMethod, ParamsOf, ResultOf };
