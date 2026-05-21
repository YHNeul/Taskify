/**
 * @file 상태 토글 커스텀 훅
 * @description 모달창, 드롭다운 등을 열고 닫는 boolean 상태를 쉽게 관리하기 위한 훅입니다.
 * @returns { [boolean, () => void] } 현재 상태값과 토글 함수 배열
 */
import { useEffect, useRef } from 'react';

export function useDropdownClose(onClose: () => void) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        onClose();
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [onClose]);

  return ref;
}
