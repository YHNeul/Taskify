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

import Image from 'next/image';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import type { Card } from '@/types/dashboard';
import CalendarIcon from '@/components/common/Icon/CalendarIcon';
import TagChip from '@/components/common/Chip/TagChip';
import UserProfileImage from '@/components/common/User/UserProfileImage';

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

export default function TaskCard({
  card,
  columnId,
  onClick,
  isDragOverlay = false,
  priority,
}: TaskCardProps) {
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

  return (
    <button
      ref={setNodeRef}
      type="button"
      style={style}
      onClick={() => onClick(card)}
      className="w-full text-left bg-white rounded-lg border border-gray-300 p-4 hover:border-brand-violet transition-colors group cursor-grab active:cursor-grabbing"
      {...attributes}
      {...listeners}
    >
      {/* 썸네일 이미지 */}
      {imageUrl && (
        <div className="relative w-full h-[160px] rounded-md overflow-hidden mb-3">
          <Image
            src={imageUrl}
            alt={title}
            fill
            priority
            className="object-cover"
            unoptimized
          />
        </div>
      )}

      {/* 제목 */}
      <p className="text-md-bold md:text-lg-bold text-gray-700 mb-2 truncate">
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
            <span className="text-xs-regular">{dueDate}</span>
          </div>
        ) : (
          <span />
        )}

        {assignee && (
          <div className="w-[26px] h-[26px] rounded-full overflow-hidden shrink-0 ring-2 ring-white">
            <UserProfileImage profile={assignee} />
          </div>
        )}
      </div>
    </button>
  );
}
