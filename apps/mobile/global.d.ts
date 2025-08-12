// global.d.ts
import type { WebView } from 'react-native-webview';

declare module '*.svg' {
  import * as React from 'react';
  import { SvgProps } from 'react-native-svg';
  const content: React.FC<SvgProps>;
  export default content;
}

declare global {
  var webviewRef: WebView<any> | null | undefined;
}
