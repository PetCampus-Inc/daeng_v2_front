function getReactNativeWebView() {
    if(typeof window === 'undefined') return null;
    return window.ReactNativeWebView ?? null;
}

export { getReactNativeWebView };