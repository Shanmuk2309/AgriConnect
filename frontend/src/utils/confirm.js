const CONFIRM_EVENT_NAME = 'agriconnect:confirm';

const confirmDialog = (messageOrConfig) => {
  if (typeof window === 'undefined') {
    return Promise.resolve(false);
  }

  const config = typeof messageOrConfig === 'string'
    ? { message: messageOrConfig }
    : (messageOrConfig || {});

  return new Promise((resolve) => {
    window.dispatchEvent(
      new CustomEvent(CONFIRM_EVENT_NAME, {
        detail: {
          title: config.title || 'Please Confirm',
          message: config.message || 'Are you sure?',
          confirmText: config.confirmText || 'Confirm',
          cancelText: config.cancelText || 'Cancel',
          tone: config.tone || 'danger',
          resolve,
        },
      })
    );
  });
};

export { CONFIRM_EVENT_NAME, confirmDialog };