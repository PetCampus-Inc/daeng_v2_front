// import WebViewScreen from "@/components/WebViewScreen";

// export default function ExploreTab() {
//     return <WebViewScreen uri="http://192.168.0.117:3000" />;
// }

import WebViewScreen from '@/components/WebViewScreen';
import { useRef } from 'react';
import WebView from 'react-native-webview';

export default function ExploreTab() {
  const webviewRef = useRef<WebView>(null);
  return <WebViewScreen uri={`http://112.187.164.12:3000`} webviewRef={webviewRef} />;
}
