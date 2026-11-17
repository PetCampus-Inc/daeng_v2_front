import WebViewScreen from '@/components/WebViewScreen';
import { API_URL } from '@/constants/apiUrl';
import { useRef, useEffect } from 'react';
import WebView from 'react-native-webview';
import { tabWebViewStore } from '@/bridges/model/tabWebViewStore';

export default function KindergartenTab() {
  const webviewRef = useRef<WebView>(null);

  useEffect(() => {
    tabWebViewStore.register('Kindergarten', webviewRef);
    return () => {
      tabWebViewStore.cleanup('Kindergarten');
    };
  }, []);

  return <WebViewScreen uri={`${API_URL}/kindergarten`} webviewRef={webviewRef} />;
}
