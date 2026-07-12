import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import {
  enableNotifications,
  disableNotifications,
  getNotificationStatus,
  registerServiceWorker,
} from '../services/notifications';

export default function NotificationSettings() {
  const { t } = useTranslation();
  const [enabled, setEnabled] = useState(false);
  const [loading, setLoading] = useState(true);
  const [supported, setSupported] = useState(false);

  useEffect(() => {
    const checkStatus = async () => {
      const isSupported = 'serviceWorker' in navigator && 'PushManager' in window;
      setSupported(isSupported);

      if (isSupported) {
        await registerServiceWorker();
        const status = await getNotificationStatus();
        setEnabled(status);
      }
      setLoading(false);
    };

    checkStatus();
  }, []);

  const handleToggle = async () => {
    setLoading(true);
    try {
      if (enabled) {
        await disableNotifications();
        setEnabled(false);
      } else {
        const success = await enableNotifications();
        setEnabled(success);
      }
    } catch (error) {
      console.error('Notification toggle error:', error);
    }
    setLoading(false);
  };

  if (!supported) {
    return null;
  }

  return (
    <div className="notification-settings">
      <div className="notification-header">
        <span className="notification-icon">🔔</span>
        <span className="notification-label">{t('pushNotifications')}</span>
        <button
          className={`toggle-btn ${enabled ? 'active' : ''}`}
          onClick={handleToggle}
          disabled={loading}
          aria-label={enabled ? t('disableNotifications') : t('enableNotifications')}
        >
          <span className="toggle-knob" />
        </button>
      </div>
      <p className="notification-desc">
        {enabled ? t('notificationsEnabled') : t('notificationsDisabled')}
      </p>
    </div>
  );
}
