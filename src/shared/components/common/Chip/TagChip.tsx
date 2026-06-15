/**
 * @file TagChip.tsx
 * @description 사용자가 입력한 값을 기반으로 태그를 생성하고,
 * 각 태그에 랜덤 색상을 적용하여 표시하는 컴포넌트입니다.
 *
 * 같은 label → 항상 같은 색상
 * 다른 label → 최대한 다른 색상
 *
 * @example
 * const value = "유저가 입력한 값"
 * <TagChip label={value} />
 *
 * @author 수경
 */

import clsx from 'clsx';

const TAG_COLORS = [
  { bg: 'bg-orange-100', text: 'text-orange-600' }, // 오렌지
  { bg: 'bg-green-100', text: 'text-green-500' }, // 그린
  { bg: 'bg-pink-100', text: 'text-pink-500' }, // 핑크
  { bg: 'bg-blue-100', text: 'text-blue-500' }, // 블루
  { bg: 'bg-purple-100', text: 'text-purple-500' }, // 퍼플
  { bg: 'bg-red-100', text: 'text-red' }, // 레드
  { bg: 'bg-teal-100', text: 'text-teal-600' }, // 민트
  { bg: 'bg-yellow-100', text: 'text-yellow-600' }, // 옐로우
];

interface TagChipProps {
  label: string;
  onClick?: () => void;
  className?: string;
}

/**
 * label 문자열 전체를 기반으로 해시값 생성
 * → 같은 문자열은 항상 같은 숫자 반환
 */
const getColorIndex = (label: string) => {
  let hash = 0;

  for (let i = 0; i < label.length; i++) {
    hash += label.charCodeAt(i);
  }

  return hash % TAG_COLORS.length; // TAG_COLORS 배열 범위 내 인덱스 반환
};

export default function TagChip({ label, onClick, className }: TagChipProps) {
  /** label 기반으로 색상 인덱스 계산 */
  const colorIndex = getColorIndex(label);
  const { bg, text } = TAG_COLORS[colorIndex];
  return (
    <div
      className={clsx('inline-flex rounded-2xl', bg, className)}
      onClick={onClick}
    >
      <p className={clsx('px-2 py-1 text-md-regular', text)}>{label}</p>
    </div>
  );
}
