/**
 * @file DropdownProgress.tsx
 * @description 진행 상태를 선택할 수 있는 드롭다운 메뉴 컴포넌트입니다.
 * 할 일 카드에서 사용됩니다.
 *
 * @author 수경
 */

'use client';

import { useState } from 'react';
import StatusChip from '@/shared/components/common/Chip/StatusChip';
import ArrowDropDownIcon from '@/shared/components/common/Icon/ArrowDropDownIcon';
import DropdownList from '@/shared/components/common/Dropdown/DropdownList';
import { Column } from '@/shared/types/dashboard';

interface Props {
  columns: Column[];
  columnTitle: string;
  onChange: (status: Column) => void;
}

export default function DropdownProgress({
  columns,
  columnTitle,
  onChange,
}: Props) {
  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState(columnTitle);

  const handleSelect = (status: Column) => {
    onChange(status);
    setTitle(status.title);
    setOpen(false);
  };
  return (
    <>
      <div className="relative sm:min-w-56">
        {/* 선택된 값 */}
        <button
          type="button"
          onClick={() => setOpen(!open)}
          className="w-full h-12 border border-gray-300 px-4 py-2 rounded-md flex justify-between items-center bg-white cursor-pointer hover:bg-gray-100 transition-colors"
        >
          <StatusChip status={title} />
          <ArrowDropDownIcon className="w-5 h-5" />
        </button>

        {/* 진행 상태 리스트 */}
        <DropdownList
          open={open}
          items={columns}
          onSelect={handleSelect}
          getKey={(status) => status.id}
          renderItem={(status) => <StatusChip status={status.title} />}
          onClose={() => setOpen(false)}
        />
      </div>
    </>
  );
}
