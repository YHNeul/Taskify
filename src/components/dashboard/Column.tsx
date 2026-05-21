'use client';

/**
 * @file Column.tsx
 * @description 칸반 보드의 단일 컬럼 컴포넌트입니다.
 * SortableContext로 카드 내 순서 변경, useDroppable로 빈 공간에 카드 드롭을 지원합니다.
 *
 * @notes
 * - 컬럼 헤더: 색상 점 + 제목 + 카드 수 chip + 톱니바퀴(수정) 아이콘
 * - '+' 버튼 클릭 → 할 일 생성 모달 오픈 (onAddCard 콜백)
 * - 톱니바퀴 클릭 → 컬럼 수정 모달 오픈 (onEditColumn 콜백)
 * - 카드 클릭 → 카드 상세 모달 오픈 (onCardClick 콜백)
 * - 카드 목록은 세로 스크롤, 무한 스크롤 지원 (cursorId 기반)
 * - 반응형: mobile 284px / tablet(md) 544px / desktop(lg) 354px
 * - useDroppable id는 `col-{id}` 문자열 — 카드 ID(숫자)와 충돌 방지
 */

import { useRef, useEffect } from 'react';
import { useDroppable } from '@dnd-kit/core';
import {
  SortableContext,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import type { Card, Column as ColumnType } from '@/types/dashboard';
import Button from '@/components/common/Button';
import SettingIcon from '@/components/common/Icon/SettingIcon';
import CountCardChip from '@/components/common/Chip/CountCardChip';
import TaskCard from './TaskCard';

const COLUMN_COLORS = ['#760DDE', '#FFA500', '#76A5EA', '#7AC555', '#E876EA'];

interface ColumnProps {
  column: ColumnType;
  cards: Card[];
  totalCount: number;
  colorIndex: number;
  onAddCard: (columnId: number) => void;
  onEditColumn: (column: ColumnType) => void;
  onCardClick: (card: Card) => void;
  onLoadMore?: (columnId: number, cursorId: number) => void;
  cursorId?: number | null;
  isLoadingMore?: boolean;
  isFirstColumn?: boolean;
}

export default function Column({
  column,
  cards,
  totalCount,
  colorIndex,
  onAddCard,
  onEditColumn,
  onCardClick,
  onLoadMore,
  cursorId,
  isLoadingMore = false,
  isFirstColumn,
}: ColumnProps) {
  const dotColor = COLUMN_COLORS[colorIndex % COLUMN_COLORS.length];
  const sentinelRef = useRef<HTMLDivElement>(null);
  const hasMore = totalCount > cards.length;

  /**
   * 컬럼 카드 목록 영역 전체를 드롭존으로 설정.
   * id를 `col-{column.id}` 문자열로 지정해 카드 ID(숫자)와 충돌을 방지.
   * 카드 목록이 비어있을 때도 드롭이 정상 동작하도록 컨테이너에 연결.
   */
  const { setNodeRef, isOver } = useDroppable({
    id: `col-${column.id}`,
    data: { type: 'column', columnId: column.id },
  });

  useEffect(() => {
    const sentinel = sentinelRef.current;
    if (!sentinel || !hasMore || !cursorId || !onLoadMore) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && !isLoadingMore) {
          onLoadMore(column.id, cursorId);
        }
      },
      { threshold: 0.1 },
    );

    observer.observe(sentinel);
    return () => observer.disconnect();
  }, [hasMore, cursorId, onLoadMore, column.id, isLoadingMore]);

  return (
    <div
      className={[
        'flex flex-col shrink-0',
        'w-full lg:w-[354px]',
        'border-b lg:border-b-0 lg:border-r border-gray-200',
        'pb-4 lg:pb-0',
      ].join(' ')}
    >
      {/* ── 컬럼 헤더 ── */}
      <div className="flex items-center justify-between px-4 md:px-5 h-[64px] shrink-0">
        <div className="flex items-center gap-2">
          <span
            className="w-2 h-2 rounded-full shrink-0"
            style={{ backgroundColor: dotColor }}
          />
          <span className="text-lg-bold md:text-2lg-bold text-gray-700">
            {column.title}
          </span>
          <CountCardChip count={totalCount} />
        </div>

        <button
          type="button"
          onClick={() => onEditColumn(column)}
          className="w-6 h-6 flex items-center justify-center text-gray-500 hover:text-gray-700 transition-colors"
          aria-label={`${column.title} 컬럼 수정`}
        >
          <SettingIcon width={24} height={24} />
        </button>
      </div>

      {/* ── '+' 할 일 추가 버튼 ── */}
      <div className="px-4 md:px-5 mb-4 shrink-0">
        <Button
          variant="secondary"
          size="add_todo"
          onClick={() => onAddCard(column.id)}
          className="w-full md:w-full lg:w-[314px]"
          aria-label="할 일 추가"
        >
          <span className="w-4 h-4 flex items-center justify-center rounded bg-brand-violet-light text-brand-violet text-lg-bold leading-none">
            +
          </span>
        </Button>
      </div>

      {/* ── 카드 목록 (SortableContext + 드롭존 + 세로 스크롤) ── */}
      <SortableContext
        items={cards.map((c) => c.id)}
        strategy={verticalListSortingStrategy}
      >
        <div
          ref={setNodeRef}
          className={[
            'flex-1 overflow-y-auto px-4 md:px-5 flex flex-col gap-2 pb-4',
            'rounded-b-[4px] transition-colors min-h-[60px]',
            isOver ? 'bg-brand-violet-light/30' : '',
          ].join(' ')}
        >
          {cards.map((card, index) => (
            <TaskCard
              key={card.id}
              card={card}
              columnId={column.id}
              onClick={onCardClick}
              priority={isFirstColumn && index === 0}
            />
          ))}

          {/* 무한 스크롤 sentinel */}
          {hasMore && <div ref={sentinelRef} className="h-1 shrink-0" />}

          {isLoadingMore && (
            <p className="text-center text-xs-regular text-gray-400 py-2">
              불러오는 중...
            </p>
          )}
        </div>
      </SortableContext>
    </div>
  );
}
