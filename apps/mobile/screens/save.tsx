// import WebViewScreen from "@/components/WebViewScreen";

// export default function SaveTab() {
//     return <WebViewScreen uri="http://192.168.0.117:3000/save" />;
// }

import WebViewScreen from '@/components/WebViewScreen';
import { API_URL } from '@/constants/apiUrl';
import { useRef, useEffect } from 'react';
import WebView from 'react-native-webview';
import { tabWebViewStore } from '@/bridges/model/tabWebViewStore';

export default function SaveTab() {
  const webviewRef = useRef<WebView>(null);

  useEffect(() => {
    tabWebViewStore.register('Save', webviewRef);
    return () => {
      tabWebViewStore.cleanup('Save');
    };
  }, []);

  return <WebViewScreen uri={`${API_URL}/save`} webviewRef={webviewRef} />;
}
