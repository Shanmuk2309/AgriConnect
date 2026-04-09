import React, { useEffect, useState } from 'react';
import { TOAST_EVENT_NAME } from '../utils/toast';

const GlobalToast = () => {
  const [toast, setToast] = useState({ show: false, message: '', type: 'info' });

  useEffect(() => {
    let timeoutId;

    const handleToast = (event) => {
      const next = event?.detail || {};
      setToast({
        show: true,
        message: next.message || '',
        type: next.type || 'info',
      });

      if (timeoutId) clearTimeout(timeoutId);
      timeoutId = setTimeout(() => {
        setToast((prev) => ({ ...prev, show: false }));
      }, 2600);
    };

    window.addEventListener(TOAST_EVENT_NAME, handleToast);
    return () => {
      if (timeoutId) clearTimeout(timeoutId);
      window.removeEventListener(TOAST_EVENT_NAME, handleToast);
    };
  }, []);

  if (!toast.show) {
    return null;
  }

  return (
    <div className={`app-toast ${toast.type}`}>
      <span className="app-toast-dot" />
      <span>{toast.message}</span>
      <style>{`
        .app-toast {
          position: fixed;
          top: 86px;
          right: 24px;
          z-index: 5000;
          display: flex;
          align-items: center;
          gap: 0.6rem;
          padding: 0.82rem 1rem;
          border-radius: 12px;
          background: #ffffff;
          border: 1px solid #e5e7eb;
          box-shadow: 0 12px 24px rgba(0, 0, 0, 0.15);
          color: #1f2937;
          font-size: 0.92rem;
          font-weight: 600;
          max-width: min(420px, calc(100vw - 30px));
          animation: appToastIn 0.25s ease-out;
        }
        .app-toast-dot {
          width: 10px;
          height: 10px;
          border-radius: 50%;
          background: #0284c7;
          flex-shrink: 0;
        }
        .app-toast.success .app-toast-dot { background: #2e7d32; }
        .app-toast.warning .app-toast-dot { background: #f57c00; }
        .app-toast.error .app-toast-dot { background: #d32f2f; }
        .app-toast.info .app-toast-dot { background: #0284c7; }
        @keyframes appToastIn {
          from { opacity: 0; transform: translateY(-8px) translateX(8px); }
          to { opacity: 1; transform: translateY(0) translateX(0); }
        }
        @media (max-width: 640px) {
          .app-toast {
            right: 12px;
            left: 12px;
            top: 78px;
            max-width: none;
          }
        }
      `}</style>
    </div>
  );
};

export default GlobalToast;