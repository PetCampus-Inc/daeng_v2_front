type ConsoleLevel = 'log' | 'info' | 'warn' | 'error';

type ConsolePatchOptions = {
  tag?: string; // RN 로그에 붙이 태그
  levels?: ConsoleLevel[]; // 패치할 레벨 목록
  masLen?: number; // 각 arg 문자열 최대 길이(과도한 로그 방지)
};

/**
 * 콘솔 패치 스크립트 생성
 * @param options
 * @returns
 */
function buildConsolePatch(options: ConsolePatchOptions = {}) {
  const { tag = '', levels = ['log', 'warn', 'error', 'info'], masLen = 1_000 } = options;

  const cfg = JSON.stringify({ tag, levels, masLen });

  return `
  (function(){
  try{
    if (window.__CONSOLE_PATCHED__) return;
    window.__CONSOLE_PATCHED__ = true;

    var CFG = ${cfg};
    var L = CFG.levels;
    var MAX = CFG.maxLen|0;

    // 패치가 로드되었음을 알리는 핸드셰이크
    try {
      if (window.ReactNativeWebView && window.ReactNativeWebView.postMessage) {
        window.ReactNativeWebView.postMessage(JSON.stringify({
          __console: true, level: 'ready', args: ['[' + CFG.tag + '] console-patch injected']
        }));
      }
    } catch(e){}

    var toStr = function (a) {
      try {
        var s = (typeof a === 'string') ? a : JSON.stringify(a);
        if (typeof s !== 'string') s = String(s);
        if (MAX > 0 && s.length > MAX) s = s.slice(0, MAX) + '…';
        return s;
      } catch(_) {
        try { return String(a); } catch(__) { return '[unserializable]'; }
      }
    };

    L.forEach(function(level){
      var orig = console[level];
      console[level] = function(){
        try{
          var args = Array.prototype.slice.call(arguments).map(toStr);
          if (window.ReactNativeWebView && window.ReactNativeWebView.postMessage) {
            window.ReactNativeWebView.postMessage(JSON.stringify({
              __console: true, level: level, tag: CFG.tag, args: args
            }));
          }
        }catch(e){}
        return orig && orig.apply(console, arguments);
      };
    });
  }catch(e){}
})();
true;`;
}

export { buildConsolePatch };
