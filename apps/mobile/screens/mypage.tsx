// import WebViewScreen from "@/components/WebViewScreen";

// export default function MyTab() {
//     return <WebViewScreen uri="http://192.168.0.117:3000/my" />;
// }

import WebViewScreen from '@/components/WebViewScreen';
import { API_URL } from '@/constants/apiUrl';
import { useRef, useEffect } from 'react';
import WebView from 'react-native-webview';
import { tabWebViewStore } from '@/bridges/model/tabWebViewStore';

export default function MyTab() {
  const webviewRef = useRef<WebView>(null);

  useEffect(() => {
    tabWebViewStore.register('Mypage', webviewRef);
    return () => {
      tabWebViewStore.cleanup('Mypage');
    };
  }, []);

  return <WebViewScreen uri={`${API_URL}/mypage`} webviewRef={webviewRef} />;
}
