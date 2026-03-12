import { BridgeMessage } from "@knockdog/bridge-core";
import { parseBridgeMessage } from "../utils/parseBridgeMessage";

class WindowMessageReceiver {
    constructor(private onMessage: (msg: BridgeMessage) => void) {}

    private attached = false;

    private handleMessage = (event: MessageEvent) => {
        const parsed = parseBridgeMessage(event.data);
        if(!parsed) return;

        this.onMessage(parsed);
    }

    attach() {
        if(this.attached) return;
        if(typeof window === 'undefined') return;

        window.addEventListener('message', this.handleMessage);
        this.attached = true;
    }
    detach() {
        if(!this.attached) return;
        if(typeof window === 'undefined') return;

        window.removeEventListener('message', this.handleMessage);
        this.attached = false;
    }
}

export { WindowMessageReceiver };