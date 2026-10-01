import { createContext, useCallback, useContext, useEffect, useState } from 'react';
import Dialog from '../components/Dialog';

const NotificationContext = createContext(null);

export function NotificationProvider({ children }) {
    const [notification, setNotification] = useState(null);

    const showSuccess = useCallback((text) => {
        setNotification({ type: 'success', title: 'Success', text });
    }, []);

    const dismiss = useCallback(() => setNotification(null), []);

    useEffect(() => {
        if (!notification) return undefined;

        const timeoutId = window.setTimeout(dismiss, 4000);
        return () => window.clearTimeout(timeoutId);
    }, [notification, dismiss]);

    return (
        <NotificationContext.Provider value={{ showSuccess }}>
            {children}
            <Dialog
                type={notification?.type}
                title={notification?.title}
                text={notification?.text}
                open={Boolean(notification)}
                onClose={dismiss}
            />
        </NotificationContext.Provider>
    );
}

export function useNotification() {
    const context = useContext(NotificationContext);
    if (!context) {
        throw new Error('useNotification must be used within a NotificationProvider');
    }
    return context;
}
