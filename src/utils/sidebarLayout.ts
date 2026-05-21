/**
 * @file sidebarLayout.ts
 * @description 사이드바 너비 및 레이아웃 breakpoint 관련 유틸 함수 모음입니다.
 *
 * ### 레이아웃 기준
 * | LayoutType  | 사이드바 너비  | 화면 너비       |
 * |-------------|--------------|----------------|
 * | `mobile`    | 67px (아이콘만) | `< 768px`      |
 * | `tablet`    | 160px         | `768px~1023px` |
 * | `desktop`   | 300px         | `>= 1024px`    |
 *
 * @notes
 * - localStorage 키 형식: `sidemenu-width-{breakpoint}`
 * - 시크릿 모드 등 localStorage 비활성 환경에서는 조용히 무시합니다.
 */

/** 사이드바 레이아웃 모드 */
export type LayoutType = 'mobile' | 'tablet' | 'desktop';

/** 사이드바 최소 너비 (px) */
export const SIDEBAR_MIN_WIDTH = 67;

/** 사이드바 최대 너비 (px) */
export const SIDEBAR_MAX_WIDTH = 500;

/**
 * 현재 뷰포트 너비를 기준으로 breakpoint를 반환합니다.
 *
 * @returns 현재 화면에 해당하는 `LayoutType`
 */
export function getBreakpoint(): LayoutType {
  const w = window.innerWidth;
  if (w < 768) return 'mobile';
  if (w < 1024) return 'tablet';
  return 'desktop';
}

/**
 * breakpoint별 사이드바 기본 너비를 반환합니다.
 *
 * @param bp - 적용할 breakpoint
 * @returns 기본 너비 (px)
 */
export function getDefaultWidth(bp: LayoutType): number {
  if (bp === 'mobile') return SIDEBAR_MIN_WIDTH;
  if (bp === 'tablet') return 160;
  return 300;
}

/**
 * localStorage에 저장된 사이드바 너비를 읽어 반환합니다.
 * 저장된 값이 없거나 허용 범위를 벗어나면 `null`을 반환합니다.
 *
 * @param bp - breakpoint 문자열 (키 생성에 사용)
 * @returns 저장된 너비(px) 또는 `null`
 */
export function getSavedWidth(bp: string): number | null {
  try {
    const raw = localStorage.getItem(`sidemenu-width-${bp}`);
    if (!raw) return null;
    const parsed = Number(raw);
    return !isNaN(parsed) &&
      parsed >= SIDEBAR_MIN_WIDTH &&
      parsed <= SIDEBAR_MAX_WIDTH
      ? parsed
      : null;
  } catch {
    return null;
  }
}

/**
 * 현재 사이드바 너비를 localStorage에 저장합니다.
 *
 * @param bp - breakpoint 문자열 (키 생성에 사용)
 * @param width - 저장할 너비 (px)
 */
export function saveSidebarWidth(bp: string, width: number): void {
  try {
    localStorage.setItem(`sidemenu-width-${bp}`, String(width));
  } catch {
    // 시크릿 모드 등
  }
}
