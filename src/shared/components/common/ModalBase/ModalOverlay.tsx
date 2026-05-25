/**
 * ModalOverlay
 * ----------------------------------------
 * 오버레이 배경, portal 이동, 외부 클릭 닫기를 담당하는 컴포넌트입니다.
 *
 * 역할:
 * - 오버레이 배경(bg-black/70) 렌더링
 * - createPortal을 통해 #modal-root에 마운트
 * - 오버레이 클릭 시 onClose 실행
 *
 * 사용 방법:
 * - 오버레이가 필요한 모달에서 ModalBase를 감싸서 사용
 * - 중첩 모달(ConfirmModal 등)에서는 사용하지 않음
 *
 */

'use client';

import { ReactNode, useRef } from 'react';
import { createPortal } from 'react-dom';

interface ModalOverlayProps {
  children: ReactNode;
  onClose: () => void;
}

export default function ModalOverlay({ children, onClose }: ModalOverlayProps) {
  const overlayRef = useRef<HTMLDivElement>(null);

  const handleOverlayClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === overlayRef.current) {
      onClose();
    }
  };

  const portalRoot = document.getElementById('modal-root') as HTMLElement;

  return createPortal(
    <div
      ref={overlayRef}
      className="fixed inset-0 z-50 flex items-center justify-center px-[20px] mobile:px-[33px] bg-black/70"
      onMouseDown={handleOverlayClick}
    >
      {children}
    </div>,
    portalRoot,
  );
}
