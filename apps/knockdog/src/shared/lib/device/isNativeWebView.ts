function isNativeWebView() {
  return typeof window !== 'undefined' && !!(window as any).ReactNativeWebView;
}

export { isNativeWebView };
