// import WebViewScreen from "@/components/WebViewScreen";

// export default function CompareTab() {
//     return <WebViewScreen uri="http://192.168.0.117:3000/compare" />;
// }

import WebViewScreen from '@/components/WebViewScreen';
import { API_URL } from '@/constants/apiUrl';
import { useRef } from 'react';
import WebView from 'react-native-webview';

export default function CompareTab() {
  const webviewRef = useRef<WebView>(null);
  return <WebViewScreen uri={`${API_URL}/compare`} webviewRef={webviewRef} />;
}
