import WebViewScreen from '@/components/WebViewScreen';
import { API_URL } from '@/constants/apiUrl';
import { useRef, useEffect } from 'react';
import WebView from 'react-native-webview';
import { tabWebViewStore } from '@/bridges/model/tabWebViewStore';

export default function ReservationTab() {
  const webviewRef = useRef<WebView>(null);

  useEffect(() => {
    tabWebViewStore.register('Reserve', webviewRef);
    return () => {
      tabWebViewStore.cleanup('Reserve');
    };
  }, []);

  return <WebViewScreen uri={`${API_URL}/reservation`} webviewRef={webviewRef} />;
}
