import type { LocationRPCSchema } from '../domains/location';
import type { NavigationRPCSchema } from '../domains/navigation';
import type { SafeAreaRPCSchema } from '../domains/safe-area';
import type { ToastRPCSchema } from '../domains/toast';
import type { AppVersionRPCSchema } from '../domains/app-version';
import type { SystemRPCSchema } from '../domains/system';


type RPCSchema = LocationRPCSchema & NavigationRPCSchema & SafeAreaRPCSchema & SystemRPCSchema & ToastRPCSchema & AppVersionRPCSchema ;

type ParamsOf<K extends RPCMethod> = RPCSchema[K]['params'];
type ResultOf<K extends RPCMethod> = RPCSchema[K]['result'];
type RPCMethod = keyof RPCSchema;

export type { RPCMethod, ParamsOf, ResultOf };