import { BridgeException } from "@knockdog/bridge-core";
import { getReactNativeWebView } from "../env/getReactNativeWebView";


interface PostToNativeOptions {
    warnOnNoNative?: boolean;
    slient?:boolean;
}

function postToNative(message: string, options: PostToNativeOptions = {}) {
    const webView = getReactNativeWebView();

    if(!webView) {
        if(options.warnOnNoNative && !options.slient && process.env.NODE_ENV !== 'production') {
            console.warn('[bridge-web] ReactNativeWebView가 없습니다. 이벤트를 보낼 상대가 없습니다.');
        }

        throw new BridgeException({
            code: 'ENOTFOUND',
            message: 'ReactNativeWebView가 없습니다. 이벤트를 보낼 상대가 없습니다.',
            data: { message },
        });
    }

    webView.postMessage(message);
}

export { postToNative };