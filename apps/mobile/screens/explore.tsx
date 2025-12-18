// import WebViewScreen from "@/components/WebViewScreen";

// export default function ExploreTab() {
//     return <WebViewScreen uri="http://192.168.0.117:3000" />;
// }

import WebViewScreen from '@/components/WebViewScreen';
import { API_URL } from '@/constants/apiUrl';
import { useRef, useEffect } from 'react';
import WebView from 'react-native-webview';
import { tabWebViewStore } from '@/bridges/model/tabWebViewStore';

export default function ExploreTab() {
  const webviewRef = useRef<WebView>(null);

  useEffect(() => {
    tabWebViewStore.register('Explore', webviewRef);
    return () => {
      tabWebViewStore.cleanup('Explore');
    };
  }, []);

  return <WebViewScreen uri={`${API_URL}`} webviewRef={webviewRef} />;
}
