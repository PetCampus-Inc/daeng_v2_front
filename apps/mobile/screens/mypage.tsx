// import WebViewScreen from "@/components/WebViewScreen";

// export default function MyTab() {
//     return <WebViewScreen uri="http://192.168.0.117:3000/my" />;
// }

import WebViewScreen from '@/components/WebViewScreen';
import { API_URL } from '@/constants/apiUrl';
import { useRef } from 'react';
import WebView from 'react-native-webview';

export default function MyTab() {
  const webviewRef = useRef<WebView>(null);
  return <WebViewScreen uri={`${API_URL}/my`} webviewRef={webviewRef} />;
}
