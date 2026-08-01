import WebViewScreen from '@/components/WebViewScreen';
import { API_URL } from '@/constants/apiUrl';
import { useRef, useEffect } from 'react';
import WebView from 'react-native-webview';
import { tabWebViewStore } from '@/bridges/model/tabWebViewStore';

export default function OwnerMembersTab() {
  const webviewRef = useRef<WebView>(null);

  useEffect(() => {
    tabWebViewStore.register('OwnerMembers', webviewRef);
    return () => {
      tabWebViewStore.cleanup('OwnerMembers');
    };
  }, []);

  return <WebViewScreen uri={`${API_URL}/owner/members`} webviewRef={webviewRef} />;
}
