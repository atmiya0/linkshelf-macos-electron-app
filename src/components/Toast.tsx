import React, { useEffect, useState } from 'react';
import { Check } from 'lucide-react';

interface ToastProps {
    message: React.ReactNode;
    duration?: number;
    onClose: () => void;
}

export const Toast: React.FC<ToastProps> = ({ message, duration = 2000, onClose }) => {
    const [isVisible, setIsVisible] = useState(false);

    useEffect(() => {
        // Small delay to ensure the mount transition triggers
        const mountTimer = setTimeout(() => setIsVisible(true), 10);

        const timer = setTimeout(() => {
            setIsVisible(false);
            setTimeout(onClose, 200); // Wait for fade out transition
        }, duration);

        return () => {
            clearTimeout(mountTimer);
            clearTimeout(timer);
        };
    }, [duration, onClose]);

    return (
        <div className={`toast-container ${isVisible ? 'visible' : ''}`} role="status" aria-live="polite">
            <div className="toast-content">
                <Check size={16} className="toast-icon" strokeWidth={2.5} aria-hidden="true" />
                <span>{message}</span>
            </div>
        </div>
    );
};
