import React, { useEffect, useState } from 'react';
import { CONFIRM_EVENT_NAME } from '../utils/confirm';

const GlobalConfirm = () => {
  const [queue, setQueue] = useState([]);

  useEffect(() => {
    const handleConfirmEvent = (event) => {
      const payload = event?.detail;
      if (!payload || typeof payload.resolve !== 'function') {
        return;
      }

      setQueue((prev) => [...prev, payload]);
    };

    window.addEventListener(CONFIRM_EVENT_NAME, handleConfirmEvent);
    return () => {
      window.removeEventListener(CONFIRM_EVENT_NAME, handleConfirmEvent);
    };
  }, []);

  const active = queue[0];
  if (!active) {
    return null;
  }

  const close = (result) => {
    try {
      active.resolve(Boolean(result));
    } finally {
      setQueue((prev) => prev.slice(1));
    }
  };

  const confirmBtnBg = active.tone === 'danger' ? '#d32f2f' : '#1565c0';

  return (
    <div style={overlayStyle}>
      <div style={modalStyle}>
        <div style={headerStyle}>
          <h3 style={titleStyle}>{active.title}</h3>
          <button style={closeStyle} onClick={() => close(false)}>&times;</button>
        </div>
        <p style={messageStyle}>{active.message}</p>
        <div style={actionsStyle}>
          <button style={cancelBtnStyle} onClick={() => close(false)}>{active.cancelText}</button>
          <button style={{ ...confirmBtnStyle, background: confirmBtnBg }} onClick={() => close(true)}>{active.confirmText}</button>
        </div>
      </div>
    </div>
  );
};

const overlayStyle = {
  position: 'fixed',
  inset: 0,
  background: 'rgba(0, 0, 0, 0.45)',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  zIndex: 5100,
  padding: '1rem',
};

const modalStyle = {
  width: '100%',
  maxWidth: '460px',
  background: '#fff',
  borderRadius: '12px',
  padding: '1rem 1rem 1.1rem',
  boxShadow: '0 20px 40px rgba(0, 0, 0, 0.2)',
  border: '1px solid #e5e7eb',
};

const headerStyle = {
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
};

const titleStyle = {
  margin: 0,
  color: '#111827',
  fontSize: '1.1rem',
};

const closeStyle = {
  border: 'none',
  background: 'transparent',
  color: '#6b7280',
  fontSize: '1.45rem',
  cursor: 'pointer',
  lineHeight: 1,
};

const messageStyle = {
  margin: '0.8rem 0 1.1rem',
  color: '#374151',
  fontSize: '0.95rem',
};

const actionsStyle = {
  display: 'flex',
  justifyContent: 'flex-end',
  gap: '0.6rem',
};

const cancelBtnStyle = {
  border: '1px solid #d1d5db',
  background: '#fff',
  color: '#374151',
  borderRadius: '8px',
  padding: '0.55rem 0.9rem',
  fontWeight: 600,
  cursor: 'pointer',
};

const confirmBtnStyle = {
  border: 'none',
  color: '#fff',
  borderRadius: '8px',
  padding: '0.55rem 0.9rem',
  fontWeight: 700,
  cursor: 'pointer',
};

export default GlobalConfirm;