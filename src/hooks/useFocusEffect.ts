import { useEffect, RefObject } from 'react';

export const useFocusEffect = (ref: RefObject<HTMLElement & { focus(): void }>, shouldFocus: boolean) => {
  useEffect(() => {
    if (shouldFocus && ref.current) {
      ref.current.focus();
    }
  }, [shouldFocus, ref]);
};