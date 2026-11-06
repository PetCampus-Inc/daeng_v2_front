import WebViewScreen from '@/components/WebViewScreen';
import { API_URL } from '@/constants/apiUrl';
import { useRef, useEffect } from 'react';
import WebView from 'react-native-webview';
import { tabWebViewStore } from '@/bridges/model/tabWebViewStore';

export default function OwnerDailyTab() {
  const webviewRef = useRef<WebView>(null);

  useEffect(() => {
    tabWebViewStore.register('OwnerDaily', webviewRef);
    return () => {
      tabWebViewStore.cleanup('OwnerDaily');
    };
  }, []);

  return <WebViewScreen uri={`${API_URL}/owner/daily`} webviewRef={webviewRef} />;
}
