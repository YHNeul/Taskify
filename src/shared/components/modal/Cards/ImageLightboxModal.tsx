'use client';

import { useEffect, useRef, useState } from 'react';
import ModalOverlay from '@/shared/components/common/ModalBase/ModalOverlay';
import clsx from 'clsx';
import OptimizedImageWithFallback from '@/shared/components/common/Image/OptimizedImageWithFallback';

interface ImageLightboxModalProps {
  imageUrl: string;
  alt: string;
  onClose: () => void;
}

export default function ImageLightboxModal({
  imageUrl,
  alt,
  onClose,
}: ImageLightboxModalProps) {
  const closeButtonRef = useRef<HTMLButtonElement>(null);
  const onCloseRef = useRef(onClose);
  const dragStartRef = useRef<{ x: number; y: number } | null>(null);
  const dragOriginRef = useRef<{ x: number; y: number }>({ x: 0, y: 0 });
  const [scale, setScale] = useState(1);
  const [offset, setOffset] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);

  const clampScale = (nextScale: number) => {
    return Math.min(4, Math.max(1, nextScale));
  };

  useEffect(() => {
    onCloseRef.current = onClose;
  }, [onClose]);

  useEffect(() => {
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    closeButtonRef.current?.focus();

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onCloseRef.current();
      }
    };

    const handleBrowserZoom = (event: WheelEvent) => {
      // 트랙패드 핀치(브라우저 확대) 기본 동작을 막고 이미지 줌으로 대체
      if (event.ctrlKey) {
        event.preventDefault();
      }
    };

    document.addEventListener('keydown', handleEscape);
    window.addEventListener('wheel', handleBrowserZoom, { passive: false });

    return () => {
      document.body.style.overflow = previousOverflow;
      document.removeEventListener('keydown', handleEscape);
      window.removeEventListener('wheel', handleBrowserZoom);
    };
  }, []);

  const handleImageZoom = (event: React.WheelEvent<HTMLDivElement>) => {
    if (!event.ctrlKey) return;

    const zoomStep = -event.deltaY * 0.01;
    setScale((prev) => {
      const next = clampScale(prev + zoomStep);
      if (next === 1) {
        setOffset({ x: 0, y: 0 });
      }
      return next;
    });
  };

  const handlePointerDown = (event: React.PointerEvent<HTMLImageElement>) => {
    if (scale <= 1) return;
    event.currentTarget.setPointerCapture(event.pointerId);
    dragStartRef.current = { x: event.clientX, y: event.clientY };
    dragOriginRef.current = offset;
    setIsDragging(true);
  };

  const handlePointerMove = (event: React.PointerEvent<HTMLImageElement>) => {
    if (!isDragging || !dragStartRef.current) return;
    const deltaX = event.clientX - dragStartRef.current.x;
    const deltaY = event.clientY - dragStartRef.current.y;
    setOffset({
      x: dragOriginRef.current.x + deltaX,
      y: dragOriginRef.current.y + deltaY,
    });
  };

  const handlePointerUp = (event: React.PointerEvent<HTMLImageElement>) => {
    if (event.currentTarget.hasPointerCapture(event.pointerId)) {
      event.currentTarget.releasePointerCapture(event.pointerId);
    }
    dragStartRef.current = null;
    setIsDragging(false);
  };

  return (
    <ModalOverlay onClose={onClose}>
      <div
        role="dialog"
        aria-modal="true"
        aria-label="이미지 상세 보기"
        className="relative flex h-full w-full items-center justify-center px-2 md:px-4"
        onMouseDown={onClose}
      >
        <div className="relative flex h-[70vh] w-full max-w-5xl items-center justify-center">
          <button
            ref={closeButtonRef}
            type="button"
            onClick={onClose}
            onMouseDown={(event) => event.stopPropagation()}
            aria-label="이미지 상세 닫기"
            className="absolute right-4 top-4 z-10 flex h-10 w-10 items-center justify-center rounded-full bg-black/60 text-white"
          >
            ✕
          </button>

          <div
            className="relative flex h-full w-full items-center justify-center overflow-hidden"
            onWheel={handleImageZoom}
          >
            <OptimizedImageWithFallback
              src={imageUrl}
              alt={alt}
              imageClassName={clsx(
                'max-h-full max-w-full rounded-lg object-contain transition-all',
                scale > 1 && (isDragging ? 'cursor-grabbing' : 'cursor-grab'),
              )}
              skeletonClassName="rounded-lg"
              fallback={
                <div className="flex h-full w-full items-center justify-center rounded-lg bg-gray-100 text-md-medium text-gray-500">
                  이미지를 불러오지 못했습니다.
                </div>
              }
              isFadeEnabled
              imageProps={{
                fill: true,
                priority: true,
                quality: 86,
                sizes:
                  '(max-width: 768px) 100vw, (max-width: 1280px) 80vw, 1200px',
                draggable: false,
                style: {
                  transform: `translate(${offset.x}px, ${offset.y}px) scale(${scale})`,
                  transitionDuration: isDragging ? '0ms' : '150ms',
                },
                onDragStart: (event) => event.preventDefault(),
                onMouseDown: (event) => event.stopPropagation(),
                onPointerDown: handlePointerDown,
                onPointerMove: handlePointerMove,
                onPointerUp: handlePointerUp,
                onPointerCancel: handlePointerUp,
              }}
            />
          </div>
        </div>
      </div>
    </ModalOverlay>
  );
}
