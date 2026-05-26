/**
 * @file DropdownMenu.tsx
 * @description 드랍다운 메뉴 컴포넌트입니다
 * 수정 완료, 삭제 완료 등 부모에 영향을 줘야해서 콜백 prop으로 작성했습니다.
 *
 * 메뉴 컴포넌트 흐름
 * 버튼 클릭
 *  → DropdownMenu의 onEdit / onDelete 호출
 *    → 부모의 isEditModalOpen / isDeleteModalOpen을 true로
 *      → 모달 컴포넌트 렌더링
 *
 * @author 수경
 *
 */

'use client';

const MENUS: { id: number; label: string; action: 'edit' | 'delete' }[] = [
  { id: 1, label: '수정하기', action: 'edit' },
  { id: 2, label: '삭제하기', action: 'delete' },
];

interface DropdownMenuProps {
  onEdit: () => void;
  onDelete: () => void;
}

export default function DropdownMenu({ onEdit, onDelete }: DropdownMenuProps) {
  const handleClick = (action: 'edit' | 'delete') => {
    if (action === 'edit') onEdit();
    if (action === 'delete') onDelete();
  };
  return (
    <ul className="flex flex-col gap-1 rounded-md bg-white border-2 border-gray-300 px-2 py-2 w-max">
      {MENUS.map((menu) => (
        <li key={menu.id}>
          <button
            type="button"
            onClick={() => handleClick(menu.action)}
            className="w-full rounded px-4 py-2 text-left text-md-regular text-gray-700 hover:bg-brand-violet-light hover:text-brand-violet transition-colors"
          >
            {menu.label}
          </button>
        </li>
      ))}
    </ul>
  );
}
