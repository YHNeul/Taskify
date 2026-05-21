/**
 * @file useBoardDnd.ts
 * @description 칸반 보드의 드래그앤드롭 로직을 담당하는 커스텀 훅
 *
 * ### 동작 방식
 * 1. `handleDragStart` — 드래그 시작 시 activeCard 설정 + 현재 상태 스냅샷 저장(롤백용)
 * 2. `handleDragOver` — 카드가 다른 컬럼 위에 올라오면 즉시 optimistic 이동
 * 3. `handleDragEnd` — 드롭 완료 후 같은 컬럼이면 순서 확정, 다른 컬럼이면 API 호출
 *
 * @notes
 * - `columnCardsRef`로 stale closure 없이 최신 state를 참조
 * - `clonedCardsRef`에 드래그 시작 시점의 스냅샷을 저장해 API 실패 시 롤백
 * - `findColumnId`는 ref를 직접 읽으므로 `useCallback` deps에서 제외
 * - 카드 순서는 드래그 완료 시 `saveColumnOrder`를 통해 localStorage에 저장됨
 */

import { useState, useCallback, useRef, useEffect } from 'react';
import {
  MouseSensor,
  TouchSensor,
  useSensor,
  useSensors,
  type DragStartEvent,
  type DragEndEvent,
  type DragOverEvent,
} from '@dnd-kit/core';
import { arrayMove } from '@dnd-kit/sortable';
import type { Card } from '@/types/dashboard';
import { updateCard } from '@/api/dashboard';
import { saveColumnOrder } from '@/utils/cardOrder';

/** 컬럼 하나의 카드 목록 및 페이지네이션 상태 */
export interface ColumnCardState {
  cards: Card[];
  totalCount: number;
  cursorId: number | null;
}

interface UseBoardDndProps {
  /** 컬럼 ID를 키로 하는 카드 상태 맵 */
  columnCards: Record<number, ColumnCardState>;
  /** 카드 상태를 업데이트하는 setter */
  setColumnCards: React.Dispatch<
    React.SetStateAction<Record<number, ColumnCardState>>
  >;
}

/**
 * 칸반 보드 드래그앤드롭 훅
 *
 * @param columnCards - 현재 컬럼별 카드 상태
 * @param setColumnCards - 카드 상태 업데이트 함수
 * @returns `sensors`, `activeCard`, `handleDragStart`, `handleDragOver`, `handleDragEnd`
 */
export function useBoardDnd({ columnCards, setColumnCards }: UseBoardDndProps) {
  /** DragOverlay 렌더링에 사용할 드래그 중인 카드 정보 */
  const [activeCard, setActiveCard] = useState<{
    card: Card;
    columnId: number;
  } | null>(null);

  /**
   * columnCards state의 최신 값을 항상 참조하는 ref.
   * handleDragOver / handleDragEnd 내부에서 stale closure 없이 읽기 위해 사용.
   */
  const columnCardsRef = useRef(columnCards);
  useEffect(() => {
    columnCardsRef.current = columnCards;
  }, [columnCards]);

  /**
   * 드래그 시작 시 columnCards 스냅샷.
   * API 호출 실패 시 이 값으로 롤백한다.
   */
  const clonedCardsRef = useRef<Record<number, ColumnCardState> | null>(null);

  /**
   * 카드 ID로 해당 카드가 현재 속한 컬럼 ID를 탐색
   *
   * @param cardId - 찾을 카드의 ID
   * @returns 컬럼 ID, 없으면 `null`
   */
  const findColumnId = (cardId: number): number | null => {
    for (const [colId, state] of Object.entries(columnCardsRef.current)) {
      if (state.cards.some((c) => c.id === cardId)) return Number(colId);
    }
    return null;
  };

  /**
   * 마우스: 6px 이동 후 활성화
   * 터치: 220ms 홀드 후 활성화 (스크롤과 충돌 방지)
   */
  const sensors = useSensors(
    useSensor(MouseSensor, { activationConstraint: { distance: 6 } }),
    useSensor(TouchSensor, {
      activationConstraint: { delay: 220, tolerance: 10 },
    }),
  );

  /**
   * 드래그 시작 핸들러.
   * activeCard를 설정하고 현재 상태를 스냅샷으로 저장
   */
  const handleDragStart = (event: DragStartEvent) => {
    const data = event.active.data.current as { card: Card; columnId: number };
    setActiveCard({ card: data.card, columnId: data.columnId });
    clonedCardsRef.current = JSON.parse(JSON.stringify(columnCardsRef.current));
  };

  /**
   * 드래그 중 카드가 다른 컬럼 위에 올라왔을 때 즉시 이동(optimistic update).
   * - 같은 컬럼 내 이동: useSortable 애니메이션이 처리하므로 state 변경 없음.
   * - 다른 컬럼으로 이동: 올라간 카드 바로 앞 위치에 삽입.
   */
  const handleDragOver = useCallback(
    (event: DragOverEvent) => {
      const { active, over } = event;
      if (!over || active.id === over.id) return;

      const activeId = active.id as number;
      const sourceColumnId = findColumnId(activeId);
      if (sourceColumnId === null) return;

      const overData = over.data.current as
        | { type?: string; columnId?: number }
        | undefined;

      let targetColumnId: number | null = null;
      let overCardId: number | null = null;

      if (overData?.type === 'card') {
        targetColumnId = overData.columnId ?? null;
        overCardId = over.id as number;
      } else if (overData?.type === 'column') {
        targetColumnId = overData.columnId ?? null;
      }

      if (!targetColumnId || sourceColumnId === targetColumnId) return;

      setColumnCards((prev) => {
        const sourceCards = [...(prev[sourceColumnId]?.cards ?? [])];
        const movingCard = sourceCards.find((c) => c.id === activeId);
        if (!movingCard) return prev;

        const newSource = sourceCards.filter((c) => c.id !== activeId);
        const newTarget = [...(prev[targetColumnId!]?.cards ?? [])];

        if (overCardId !== null) {
          const overIndex = newTarget.findIndex((c) => c.id === overCardId);
          if (overIndex >= 0) {
            newTarget.splice(overIndex, 0, {
              ...movingCard,
              columnId: targetColumnId!,
            });
          } else {
            newTarget.push({ ...movingCard, columnId: targetColumnId! });
          }
        } else {
          newTarget.push({ ...movingCard, columnId: targetColumnId! });
        }

        return {
          ...prev,
          [sourceColumnId]: {
            ...prev[sourceColumnId],
            cards: newSource,
            totalCount: Math.max(
              0,
              (prev[sourceColumnId]?.totalCount ?? 1) - 1,
            ),
          },
          [targetColumnId!]: {
            ...prev[targetColumnId!],
            cards: newTarget,
            totalCount: (prev[targetColumnId!]?.totalCount ?? 0) + 1,
          },
        };
      });
    },
    // findColumnId는 ref 기반이므로 deps 불필요
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [],
  );

  /**
   * 드롭 완료 핸들러.
   * - 같은 컬럼 내 재배치: `arrayMove`로 최종 순서 확정
   * - 다른 컬럼으로 이동: `handleDragOver`에서 이미 optimistic 처리됨 → API 호출만 수행
   * - API 실패 시 `clonedCardsRef`로 state와 localStorage 모두 롤백
   */
  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;
    setActiveCard(null);

    const activeId = active.id as number;
    const currentColumnId = findColumnId(activeId);

    if (!over || currentColumnId === null) {
      if (clonedCardsRef.current) setColumnCards(clonedCardsRef.current);
      clonedCardsRef.current = null;
      return;
    }

    const overData = over.data.current as
      | { type?: string; columnId?: number }
      | undefined;
    const overCardId = over.id as number;

    if (
      overData?.type === 'card' &&
      overData.columnId === currentColumnId &&
      activeId !== overCardId
    ) {
      const cards = columnCardsRef.current[currentColumnId]?.cards ?? [];
      const oldIdx = cards.findIndex((c) => c.id === activeId);
      const newIdx = cards.findIndex((c) => c.id === overCardId);

      if (oldIdx !== -1 && newIdx !== -1 && oldIdx !== newIdx) {
        setColumnCards((prev) => ({
          ...prev,
          [currentColumnId]: {
            ...prev[currentColumnId],
            cards: arrayMove(prev[currentColumnId].cards, oldIdx, newIdx),
          },
        }));
      }
    }

    const savedClone = clonedCardsRef.current;
    clonedCardsRef.current = null;
    if (!savedClone) return;

    let originalColumnId: number | null = null;
    for (const [colId, state] of Object.entries(savedClone)) {
      if (state.cards.some((c) => c.id === activeId)) {
        originalColumnId = Number(colId);
        break;
      }
    }

    // setColumnCards 콜백 내부에서 prev를 읽어야 arrayMove 적용 후의 최신 순서를 저장할 수 있음
    const colsToSave = new Set<number>([currentColumnId]);
    if (originalColumnId !== null) colsToSave.add(originalColumnId);

    setColumnCards((prev) => {
      for (const colId of colsToSave) {
        saveColumnOrder(
          colId,
          (prev[colId]?.cards ?? []).map((c) => c.id),
        );
      }
      return prev;
    });

    if (originalColumnId !== null && originalColumnId !== currentColumnId) {
      try {
        await updateCard(activeId, { columnId: currentColumnId });
      } catch {
        setColumnCards(savedClone);
        for (const [colId, state] of Object.entries(savedClone)) {
          saveColumnOrder(
            Number(colId),
            state.cards.map((c) => c.id),
          );
        }
      }
    }
  };

  return {
    sensors,
    activeCard,
    handleDragStart,
    handleDragOver,
    handleDragEnd,
  };
}
