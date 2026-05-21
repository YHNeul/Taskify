/**
 * @file useSidebarResize.ts
 * @description 사이드바 너비 드래그 리사이즈를 처리하는 커스텀 훅
 *
 * ### 동작 방식
 * - 마운트 시 breakpoint를 감지하고 localStorage에 저장된 너비(없으면 기본값)를 적용
 * - 창 크기 변경 시 breakpoint가 바뀌면 해당 breakpoint의 저장된 너비로 자동 전환
 * - `handleResizeStart`를 핸들 요소의 `onPointerDown`에 연결하면 드래그 리사이즈가 활성화됨
 * - rAF(requestAnimationFrame)를 사용해 렌더링 성능을 최적화
 * - 드래그 종료 시 최종 너비를 localStorage에 저장
 *
 * @notes
 * - `sidebarWidth`가 `null`인 동안에는 SSR 상태로, CSS 클래스 기반 반응형이 적용됩니다.
 * - `layout`은 `sidebarWidth`에서 파생되며, null이면 CSS 반응형 클래스로 처리합니다.
 */

import { useState, useRef, useCallback, useEffect, useMemo } from 'react';
import {
  type LayoutType,
  SIDEBAR_MIN_WIDTH,
  SIDEBAR_MAX_WIDTH,
  getBreakpoint,
  getDefaultWidth,
  getSavedWidth,
  saveSidebarWidth,
} from '@/utils/sidebarLayout';

/**
 * 사이드바 너비 리사이즈 훅
 *
 * @returns
 * - `sidebarWidth` — 현재 사이드바 너비(px). 초기값은 `null`(SSR 상태).
 * - `layout` — 너비 기반으로 계산된 레이아웃 타입. `null`이면 CSS 클래스 기반 반응형.
 * - `handleResizeStart` — 리사이즈 핸들의 `onPointerDown`에 연결할 이벤트 핸들러.
 */
export function useSidebarResize() {
  const [sidebarWidth, setSidebarWidth] = useState<number | null>(null);

  /** rAF 외부에서 최신 너비를 읽기 위한 ref (setSidebarWidth의 비동기성 우회) */
  const currentWidthRef = useRef<number>(300);

  /** 이전 breakpoint를 추적해 불필요한 너비 재적용을 방지 */
  const currentBpRef = useRef<string>('');

  useEffect(() => {
    const applyWidth = (bp: LayoutType) => {
      const w = getSavedWidth(bp) ?? getDefaultWidth(bp);
      currentWidthRef.current = w;
      setSidebarWidth(w);
    };

    const handleResize = () => {
      const bp = getBreakpoint();
      if (bp === currentBpRef.current) return;
      currentBpRef.current = bp;
      applyWidth(bp);
    };

    const bp = getBreakpoint();
    currentBpRef.current = bp;
    applyWidth(bp);

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  /**
   * 너비 → 레이아웃 타입 매핑
   * - `null` : SSR / 초기화 전
   * - `< 100px` : mobile
   * - `< 220px` : tablet
   * - `>= 220px` : desktop
   */
  const layout = useMemo<LayoutType | null>(() => {
    if (sidebarWidth === null) return null;
    if (sidebarWidth < 100) return 'mobile';
    if (sidebarWidth < 220) return 'tablet';
    return 'desktop';
  }, [sidebarWidth]);

  /**
   * 리사이즈 핸들의 pointerdown 이벤트 핸들러.
   * pointermove / pointerup 이벤트를 document에 동적으로 등록해 드래그를 처리
   */
  const handleResizeStart = useCallback((e: React.PointerEvent) => {
    e.preventDefault();
    e.stopPropagation();
    e.currentTarget.setPointerCapture?.(e.pointerId);

    const startX = e.clientX;
    const startWidth = currentWidthRef.current;
    let rafId: number | null = null;
    let nextWidth = startWidth;

    const handleMove = (moveEvent: PointerEvent) => {
      nextWidth = Math.max(
        SIDEBAR_MIN_WIDTH,
        Math.min(SIDEBAR_MAX_WIDTH, startWidth + (moveEvent.clientX - startX)),
      );
      if (rafId !== null) return;
      rafId = window.requestAnimationFrame(() => {
        currentWidthRef.current = nextWidth;
        setSidebarWidth(nextWidth);
        rafId = null;
      });
    };

    const handleUp = () => {
      document.removeEventListener('pointermove', handleMove);
      document.removeEventListener('pointerup', handleUp);
      document.removeEventListener('pointercancel', handleUp);
      if (rafId !== null) {
        window.cancelAnimationFrame(rafId);
        rafId = null;
      }
      saveSidebarWidth(getBreakpoint(), currentWidthRef.current);
    };

    document.addEventListener('pointermove', handleMove);
    document.addEventListener('pointerup', handleUp);
    document.addEventListener('pointercancel', handleUp);
  }, []);

  return { sidebarWidth, layout, handleResizeStart };
}
