import type { BridgeMessage } from "@knockdog/bridge-core";

class GlobalBridgeAdapter {
    private attached = false;
    private previousBridge = typeof window !== 'undefined' ? window.__bridge : undefined;

    constructor(private onMessage: (msg: BridgeMessage) => void, private debug = false) {}

    private receive = (msg: BridgeMessage) => {
        this.onMessage(msg);
    }

    attach() {
        if (this.attached) return;
        if (typeof window === 'undefined') return;

        const current = window.__bridge;

        if(current && (this.debug || window.__bridgeDebug)) {
            console.warn('[bridge-web] window.__bridge 가 이미 설정되어 있습니다. 리시버를 덮어씁니다.');
        }

        this.previousBridge = current;
        window.__bridge = { receive: this.receive };
        this.attached = true;
    }

    detach() {
        if(!this.attached) return;
        if(typeof window === 'undefined') return;

        if(this.previousBridge) {
            window.__bridge = this.previousBridge;
        } else {
            delete window.__bridge;
        }

        this.attached = false;
    }
}

export { GlobalBridgeAdapter };