import { BridgeException } from '@knockdog/bridge-core';

type PendingRequestEntry = {
    resolve: (v: unknown) => void;
    reject: (e: BridgeException) => void;
    timer: ReturnType<typeof setTimeout>;
}

class PendingRequestManager {
    private pending = new Map<string, PendingRequestEntry>();

    set(id: string, entry: PendingRequestEntry) {
        this.pending.set(id, entry);
    }

    resolve(id: string, result: unknown) {
        const entry = this.pending.get(id);
        if(!entry) return false;

        clearTimeout(entry.timer);
        this.pending.delete(id);

        entry.resolve(result);
        return true;
    }

    reject(id: string, error: BridgeException) {
        const entry = this.pending.get(id);
        if(!entry) return false;

        clearTimeout(entry.timer);
        this.pending.delete(id);

        entry.reject(error);
        return true;
    }

    remove(id: string) {
        const entry = this.pending.get(id);
        if(!entry) return false;

        clearTimeout(entry.timer);
        this.pending.delete(id);
        return true;
    }

    rejectAll(error: BridgeException) {
        this.pending.forEach((entry) => {
            clearTimeout(entry.timer);
            entry.reject(error);
        });

        this.pending.clear();
    }

    has(id: string) {
        return this.pending.has(id);
    }

    size() {
        return this.pending.size;
    }
}

export { PendingRequestManager };