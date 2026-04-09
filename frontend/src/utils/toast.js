const TOAST_EVENT_NAME = 'agriconnect:toast';

const dispatchToast = (message, type = 'info') => {
  if (typeof window === 'undefined') return;

  window.dispatchEvent(
    new CustomEvent(TOAST_EVENT_NAME, {
      detail: {
        message: String(message ?? ''),
        type,
      },
    })
  );
};

const toast = {
  info: (message) => dispatchToast(message, 'info'),
  success: (message) => dispatchToast(message, 'success'),
  warning: (message) => dispatchToast(message, 'warning'),
  error: (message) => dispatchToast(message, 'error'),
};

const installAlertToToastBridge = () => {
  if (typeof window === 'undefined') return;
  if (window.__agriAlertBridgeInstalled) return;

  window.__agriAlertBridgeInstalled = true;
  window.alert = (message) => {
    dispatchToast(message, 'info');
  };
};

export { TOAST_EVENT_NAME, dispatchToast, toast, installAlertToToastBridge };