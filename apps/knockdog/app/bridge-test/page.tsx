'use client';

import { useEffect, useState } from 'react';
// eslint-disable-next-line fsd/no-global-store-imports
import { useBridgeStore } from '@shared/store/useBridgeStore';

export default function BridgeTestPage() {
  const { lastReceivedType, payload, sendBridgeMessage } = useBridgeStore();
  const [status, setStatus] = useState<'idle' | 'waiting' | 'ok' | 'fail'>(
    'idle'
  );

  // 앱 쪽 살아있는지 핑
  useEffect(() => {
    setStatus('waiting');
    sendBridgeMessage?.('ping', { from: 'web:init' });
    const time = setTimeout(
      () => setStatus((status) => (status === 'waiting' ? 'fail' : status)),
      2000
    );
    return () => clearTimeout(time);
  }, [sendBridgeMessage]);

  useEffect(() => {
    if (lastReceivedType === 'pong') setStatus('ok');
  }, [lastReceivedType]);

  return (
    <div style={{ padding: 16, fontFamily: 'system-ui' }}>
      <h1>Bridge Test (Web → App)</h1>
      <p>
        Status: <b>{status}</b>
      </p>

      <div style={{ display: 'flex', gap: 8 }}>
        <button
          onClick={() => sendBridgeMessage?.('ping', { from: 'web:manual' })}
        >
          Send PING to App
        </button>
        <button
          onClick={() => sendBridgeMessage?.('whatever', { time: Date.now() })}
        >
          Send CUSTOM event
        </button>
      </div>

      <hr style={{ margin: '16px 0' }} />
      <div>
        <div>
          Last Received Type: <b>{lastReceivedType ?? '-'}</b>
        </div>
        <pre style={{ background: '#f6f6f6', padding: 12 }}>
          {JSON.stringify(payload, null, 2)}
        </pre>
      </div>
    </div>
  );
}
