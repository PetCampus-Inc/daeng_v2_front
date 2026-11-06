import WebViewScreen from '@/components/WebViewScreen';
import { API_URL } from '@/constants/apiUrl';
import { useRef, useEffect } from 'react';
import WebView from 'react-native-webview';
import { tabWebViewStore } from '@/bridges/model/tabWebViewStore';

export default function OwnerHomeTab() {
  const webviewRef = useRef<WebView>(null);

  useEffect(() => {
    tabWebViewStore.register('OwnerHome', webviewRef);
    return () => {
      tabWebViewStore.cleanup('OwnerHome');
    };
  }, []);

  return <WebViewScreen uri={`${API_URL}/owner`} webviewRef={webviewRef} />;
}
