import WebViewScreen from '@/components/WebViewScreen';
import { API_URL } from '@/constants/apiUrl';
import { useRef, useEffect } from 'react';
import WebView from 'react-native-webview';
import { tabWebViewStore } from '@/bridges/model/tabWebViewStore';

export default function OwnerAlbumTab() {
  const webviewRef = useRef<WebView>(null);

  useEffect(() => {
    tabWebViewStore.register('OwnerAlbum', webviewRef);
    return () => {
      tabWebViewStore.cleanup('OwnerAlbum');
    };
  }, []);

  return <WebViewScreen uri={`${API_URL}/owner/album`} webviewRef={webviewRef} />;
}
