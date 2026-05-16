import { useState, useRef, useCallback } from 'react';

/**
 * useToast
 * Returns { toast, showToast }
 *
 * toast  → { msg: string, type: 'success'|'error'|'', visible: boolean }
 * showToast(msg, type?, duration?) → displays the toast then auto-hides
 */
export function useToast() {
  const [toast, setToast] = useState({ msg: '', type: '', visible: false });
  const timerRef = useRef(null);

  const showToast = useCallback((msg, type = '', duration = 3000) => {
    clearTimeout(timerRef.current);
    setToast({ msg, type, visible: true });
    timerRef.current = setTimeout(
      () => setToast((prev) => ({ ...prev, visible: false })),
      duration
    );
  }, []);

  return { toast, showToast };
}
