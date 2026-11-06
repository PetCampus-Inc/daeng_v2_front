const NATIVE_BACK_INJECT = `
  (function () {
    try {
      var ev = new CustomEvent('knockdog:native-back', { cancelable: true });
      var allowed = window.dispatchEvent(ev);
      if (allowed) {
        window.ReactNativeWebView.postMessage(
          JSON.stringify({ type: 'knockdog:native-back-unhandled' })
        );
      }
    } catch (e) {
      window.ReactNativeWebView.postMessage(
        JSON.stringify({ type: 'knockdog:native-back-unhandled' })
      );
    }
  })();
  true;
`;

export { NATIVE_BACK_INJECT };
