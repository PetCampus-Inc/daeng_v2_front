import { getQueryClient } from '@shared/api';

type BroadcastMessageType = 'INVALIDATE_QUERIES' | 'REFETCH_QUERIES' | 'RELOAD_WEBVIEW';
type QueryKey = Array<string | number>;

interface BroadcastMessage {
  type: BroadcastMessageType;
  queryKey?: QueryKey;
}

const createWebViewSyncChannel = () => {
  if (typeof window === 'undefined' || !('BroadcastChannel' in window)) {
    return null;
  }
  return new BroadcastChannel('webview-sync-channel');
};

const webViewSyncChannel = createWebViewSyncChannel();

if (webViewSyncChannel) {
  const queryClient = getQueryClient();

  webViewSyncChannel.onmessage = ({ data }: MessageEvent<BroadcastMessage>) => {
    const { type, queryKey } = data;

    switch (type) {
      case 'INVALIDATE_QUERIES':
        if (queryKey) queryClient.invalidateQueries({ queryKey });
        break;
      case 'REFETCH_QUERIES':
        if (queryKey) queryClient.refetchQueries({ queryKey });
        break;
      case 'RELOAD_WEBVIEW':
        window.location.reload();
        break;
    }
  };
}

const syncWebViewQuery = {
  invalidate: (queryKey: QueryKey) => webViewSyncChannel?.postMessage({ type: 'INVALIDATE_QUERIES', queryKey }),
  refetch: (queryKey: QueryKey) => webViewSyncChannel?.postMessage({ type: 'REFETCH_QUERIES', queryKey }),
  reload: () => webViewSyncChannel?.postMessage({ type: 'RELOAD_WEBVIEW' }),
} as const;

export { webViewSyncChannel, syncWebViewQuery };
