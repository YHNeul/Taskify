'use client';

/**
 * @file TaskCard.tsx
 * @description 칸반 보드의 할 일 카드 컴포넌트입니다.
 * 카드를 클릭하면 상세 모달이 열리고, 드래그앤드롭으로 컬럼 간 이동이 가능합니다.
 *
 * @notes
 * - 이미지가 있는 경우 카드 상단에 썸네일로 표시됩니다.
 * - 태그는 배경색 랜덤 적용 (TagChip 컴포넌트 사용)
 * - 담당자 프로필 이미지 또는 이니셜 아바타 표시
 * - isDragOverlay=true 이면 드래그 훅을 비활성화하여 오버레이에서 사용 가능
 */

import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { memo, useCallback, useEffect, useRef } from 'react';
import type { Card } from '@/shared/types/dashboard';
import { useQueryClient } from '@tanstack/react-query';
import CalendarIcon from '@/shared/components/common/Icon/CalendarIcon';
import TagChip from '@/shared/components/common/Chip/TagChip';
import UserProfileImage from '@/shared/components/common/User/UserProfileImage';
import OptimizedImageWithFallback from '@/shared/components/common/Image/OptimizedImageWithFallback';
import { QUERY_KEYS } from '@/shared/constants/queryKeys';
import { readCard } from '@/shared/apis/dashboard';

interface TaskCardProps {
  card: Card;
  /** 이 카드가 속한 컬럼 ID (드래그 데이터에 포함) */
  columnId: number;
  /** 카드 클릭 시 상세 모달 오픈 핸들러 */
  onClick: (card: Card) => void;
  /** DragOverlay 내부에서 렌더링될 때 true — 드래그 훅 비활성화 */
  isDragOverlay?: boolean;
  priority?: boolean;
}

function TaskCard({
  card,
  columnId,
  onClick,
  isDragOverlay = false,
  priority,
}: TaskCardProps) {
  const queryClient = useQueryClient();
  const prefetchTimeoutRef = useRef<number | null>(null);
  const hasPrefetchedDetailRef = useRef(false);
  const { title, tags, dueDate, assignee, imageUrl } = card;

  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id: card.id,
    data: { type: 'card', card, columnId },
    disabled: isDragOverlay,
  });

  const style: React.CSSProperties = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0 : 1,
    touchAction: 'pan-y',
  };

  const clearPrefetchTimeout = useCallback(() => {
    if (prefetchTimeoutRef.current !== null) {
      window.clearTimeout(prefetchTimeoutRef.current);
      prefetchTimeoutRef.current = null;
    }
  }, []);

  const prefetchCardDetail = useCallback(() => {
    if (hasPrefetchedDetailRef.current) return;
    hasPrefetchedDetailRef.current = true;
    void queryClient.prefetchQuery({
      queryKey: QUERY_KEYS.card(card.id),
      queryFn: () => readCard(card.id),
      staleTime: 1000 * 60 * 2,
    });
  }, [card.id, queryClient]);

  const schedulePrefetchCardDetail = useCallback(() => {
    if (hasPrefetchedDetailRef.current) return;
    clearPrefetchTimeout();
    prefetchTimeoutRef.current = window.setTimeout(() => {
      prefetchCardDetail();
      prefetchTimeoutRef.current = null;
    }, 120);
  }, [clearPrefetchTimeout, prefetchCardDetail]);

  useEffect(
    () => () => {
      clearPrefetchTimeout();
    },
    [clearPrefetchTimeout],
  );

  return (
    <button
      ref={setNodeRef}
      type="button"
      style={style}
      onClick={() => onClick(card)}
      onMouseEnter={schedulePrefetchCardDetail}
      onMouseLeave={clearPrefetchTimeout}
      onFocus={schedulePrefetchCardDetail}
      onBlur={clearPrefetchTimeout}
      className="w-full text-left bg-white rounded-card-sm border border-gray-300 p-4 hover:border-brand-violet transition-colors group cursor-grab active:cursor-grabbing"
      {...attributes}
      {...listeners}
    >
      {/* 썸네일 이미지 */}
      {imageUrl && (
        <div className="relative w-full h-40 rounded-md overflow-hidden mb-3">
          <OptimizedImageWithFallback
            src={imageUrl}
            alt={title}
            imageClassName="object-cover"
            fallback={
              <div className="flex h-full w-full items-center justify-center bg-gray-100 typo-xs-medium text-gray-400">
                이미지를 불러올 수 없습니다.
              </div>
            }
            imageProps={{
              fill: true,
              priority,
              sizes:
                '(max-width: 767px) calc(100vw - 32px), (max-width: 1023px) calc(100vw - 40px), 314px',
            }}
          />
        </div>
      )}

      {/* 제목 */}
      <p className="typo-md-bold md:typo-lg-bold text-gray-700 mb-2 truncate">
        {title}
      </p>

      {/* 태그 목록 */}
      {tags.length > 0 && (
        <div className="flex flex-wrap gap-1.5 mb-2">
          {tags.map((tag) => (
            <TagChip key={tag} label={tag} />
          ))}
        </div>
      )}

      {/* 하단: 마감일 + 담당자 */}
      <div className="flex items-center justify-between mt-2">
        {dueDate ? (
          <div className="flex items-center gap-1 text-gray-400">
            <CalendarIcon width={14} height={14} />
            <span className="typo-xs-regular">{dueDate}</span>
          </div>
        ) : (
          <span />
        )}

        {assignee && (
          <div className="w-avatar-26 h-avatar-26 rounded-full overflow-hidden shrink-0 ring-2 ring-white">
            <UserProfileImage profile={assignee} />
          </div>
        )}
      </div>
    </button>
  );
}

export default memo(TaskCard);
