import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { syncService } from '../services/sync';

export default function SyncStatus() {
  const { t } = useTranslation();
  const [status, setStatus] = useState<'connected' | 'disconnected' | 'syncing'>('disconnected');
  const [lastSync, setLastSync] = useState<string | null>(null);

  useEffect(() => {
    const unsubscribe = syncService.onUpdate((message) => {
      if (message.type === 'connected') {
        setStatus('connected');
      } else if (message.type === 'update' || message.type === 'delete') {
        setStatus('syncing');
        setLastSync(message.timestamp);
        setTimeout(() => setStatus('connected'), 1000);
      }
    });

    return unsubscribe;
  }, []);

  const statusColor = status === 'connected' ? 'var(--accent)' :
                      status === 'syncing' ? 'var(--gold)' : 'var(--muted)';

  return (
    <div className="sync-status" title={t('syncStatus')}>
      <span className="sync-dot" style={{ background: statusColor }} />
      <span className="sync-text">
        {status === 'connected' ? t('syncConnected') :
         status === 'syncing' ? t('syncing') : t('syncDisconnected')}
      </span>
      {lastSync && (
        <span className="sync-time">
          {new Date(lastSync).toLocaleTimeString()}
        </span>
      )}
    </div>
  );
}
