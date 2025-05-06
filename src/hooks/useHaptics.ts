export function useHaptics() {
  const isHapticsSupported = 'vibrate' in navigator;

  const hapticFeedback = {
    light: () => {
      if (isHapticsSupported) {
        navigator.vibrate(10);
      }
    },
    medium: () => {
      if (isHapticsSupported) {
        navigator.vibrate(20);
      }
    },
    heavy: () => {
      if (isHapticsSupported) {
        navigator.vibrate([30, 30]);
      }
    },
    success: () => {
      if (isHapticsSupported) {
        navigator.vibrate([10, 30, 10]);
      }
    },
    error: () => {
      if (isHapticsSupported) {
        navigator.vibrate([50, 20, 50]);
      }
    },
    warning: () => {
      if (isHapticsSupported) {
        navigator.vibrate([30, 20, 30]);
      }
    }
  };

  return hapticFeedback;
}
