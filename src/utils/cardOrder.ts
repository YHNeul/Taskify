/**
 * @file cardOrder.ts
 * @description 칸반 보드의 카드 순서를 localStorage에 유지하기 위한 유틸 함수 모음
 *
 * @notes
 * - 키 형식: `card-order-col-{columnId}`
 * - 시크릿 모드 등 localStorage를 사용할 수 없는 환경에서는 무시
 * - 저장된 ID에 없는 카드(새로 추가된 카드)는 목록 맨 뒤로 정렬됨
 */

import type { Card } from '@/types/dashboard';

/**
 * 컬럼의 현재 카드 순서를 localStorage에 저장
 *
 * @param columnId - 대상 컬럼의 ID
 * @param cardIds - 저장할 카드 ID 배열 (현재 표시 순서 기준)
 */
export function saveColumnOrder(columnId: number, cardIds: number[]): void {
  try {
    localStorage.setItem(`card-order-col-${columnId}`, JSON.stringify(cardIds));
  } catch {
    // 시크릿 모드 등 localStorage 비활성 환경에서는 무시
  }
}

/**
 * localStorage에 저장된 순서대로 카드 배열을 정렬하여 반환
 * 저장된 순서가 없거나 파싱에 실패하면 원본 배열을 그대로 반환
 *
 * @param columnId - 대상 컬럼의 ID
 * @param cards - 정렬할 카드 배열
 * @returns 저장된 순서가 적용된 카드 배열
 */
export function applySavedOrder(columnId: number, cards: Card[]): Card[] {
  try {
    const saved = localStorage.getItem(`card-order-col-${columnId}`);
    if (!saved) return cards;
    const savedIds: number[] = JSON.parse(saved);
    return [...cards].sort((a, b) => {
      const ai = savedIds.indexOf(a.id);
      const bi = savedIds.indexOf(b.id);
      if (ai === -1) return 1;
      if (bi === -1) return -1;
      return ai - bi;
    });
  } catch {
    return cards;
  }
}
