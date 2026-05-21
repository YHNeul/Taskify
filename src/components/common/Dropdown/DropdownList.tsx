/**
 * @file DropdownList.tsx
 * @description 진행 상태, 담당자 선택 드롭다운 메뉴의 리스트 컴포넌트입니다.
 *
 * @author 수경
 */

import { useDropdownClose } from '@/hooks/useToggle';

interface DropdownListProps<T> {
  /** 드롭다운 표시 여부 */
  open: boolean;
  /** 드롭다운에 렌더링할 아이템 목록 */
  items: T[];
  /** 아이템 선택 시 실행할 콜백 함수 */
  onSelect: (item: T) => void;
  /** 아이템을 어떻게 렌더링할지 정의하는 함수 */
  renderItem: (item: T) => React.ReactNode;
  /** 각 아이템의 고유 key 값을 반환하는 함수 */
  getKey: (item: T) => string | number;
  /** 드롭다운 외부 클릭 시 닫힘 */
  onClose: () => void;
  /** 미지정 버튼 콜백 */
  onClear?: () => void;
}

export default function DropdownList<T extends object>({
  open,
  items,
  onSelect,
  renderItem,
  getKey,
  onClose,
  onClear,
}: DropdownListProps<T>) {
  const ref = useDropdownClose(onClose);
  if (!open) return null;

  return (
    <div
      ref={ref}
      className="absolute z-10 mt-1 w-full border rounded bg-white shadow"
    >
      {/* 미지정 버튼 - onClear가 있을 때만 렌더링 */}
      {onClear && (
        <button
          type="button"
          onClick={onClear}
          className="w-full pl-5 py-2 text-sm text-gray-400 text-left border-b hover:bg-gray-50"
        >
          담당자 미지정
        </button>
      )}
      {items.length === 0 ? (
        <p className="pl-5 py-2 text-md-regular text-gray-400">
          검색 결과가 없습니다.
        </p>
      ) : (
        items.map((item) => (
          <button
            key={getKey(item)}
            type="button"
            onClick={() => onSelect(item)}
            className="w-full pl-5 py-2 flex items-center gap-3 group"
          >
            {/* 체크 아이콘 - 호버시에만 표시 */}
            <span className="opacity-0 group-hover:opacity-100 transition-opacity">
              <svg
                width="14"
                height="10"
                viewBox="0 0 14 10"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M4.60892 8.12758L12.5275 0.208998C12.6638 0.0726743 12.8257 0.00303754 13.0132 8.89256e-05C13.2006 -0.00284441 13.3654 0.0667924 13.5076 0.208998C13.6498 0.351188 13.7209 0.514538 13.7209 0.699047C13.7209 0.883542 13.6498 1.04689 13.5076 1.1891L5.18887 9.50783C5.02317 9.67353 4.82985 9.75638 4.60892 9.75638C4.38799 9.75638 4.19467 9.67353 4.02897 9.50783L0.201883 5.68077C0.0655599 5.54444 -0.00172341 5.38256 3.35332e-05 5.19511C0.00180576 5.00767 0.0737871 4.84286 0.215977 4.70066C0.358183 4.55846 0.521533 4.48736 0.706027 4.48736C0.890537 4.48736 1.05389 4.55846 1.19608 4.70066L4.60892 8.12758Z"
                  fill="#787486"
                />
              </svg>
            </span>

            {renderItem(item)}
          </button>
        ))
      )}
    </div>
  );
}
