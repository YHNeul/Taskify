/**
 * @file DropdownAssignee.tsx
 * @description 드롭다운 메뉴 중 담당자를 선택하는 인풋 컴포넌트입니다.
 * 인풋에 이름을 입력 시 입력한 값과 일치한 인원을 리스트업하고,
 * 담당자 리스트에는 초대받은 인원만 보여줍니다.
 *
 * ### 할 일 생성 로직
 * 1. GET /members API 호출
 * 2. 대시보드 멤버 목록 가져오기
 *
 * ### 할 일 수정 로직
 * 1. GET /cards/{cardId} API 호출 , GET /members API 호출
 * 2. 담당자 정보(cards.assignee) 값 가져오기
 * 3. 가져온 담당자 정보 렌더링
 * 4. 드롭다운에는 대시보드 멤버 목록 보여주기
 *
 * @author 수경
 */

'use client';
import { useState } from 'react';
import ArrowDropDownIcon from '../Icon/ArrowDropDownIcon';
import UserName from '../User/UserName';
import { Assignee, Member } from '@/types/dashboard';
import DropdownList from './DropdownList';

interface AssigneeProps {
  /** 드롭다운에 보여줄 전체 멤버 목록 */
  members: Member[];
  /** 이미 선택된 담당자 초기값 */
  defaultAssignee?: Assignee | null;
  /** 담당자 선택 시 선택된 유저를 부모로 전달하는 콜백 함수 */
  onSelect?: (user: number | null) => void;
  /** @defalut '이름을 입력해 주세요' */
  placeholder?: string;
}

export default function DropdownAssignee({
  members,
  defaultAssignee = null,
  onSelect,
  placeholder = '이름을 입력해 주세요',
}: AssigneeProps) {
  const [query, setQuery] = useState(''); // 인풋 입력값 관리
  const [open, setOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<Assignee | null>(
    defaultAssignee,
  ); // 초기값 적용

  const filteredMembers = members.filter((member) =>
    member.nickname.includes(query),
  );

  /** Input과 담당자가 선택된 박스의 공통 css */
  const baseStyle =
    'w-full h-[48px] border border-gray-300 px-4 py-2 rounded-md flex justify-between items-center bg-white';

  return (
    <div className="relative sm:min-w-[217px]">
      {/* 선택을 안했을 때는 입력 input 렌더링, 선택 했을 때는 사용자 이름 및 아이콘 렌더링 */}
      {selectedUser ? (
        <button
          type="button"
          className={`${baseStyle}`}
          onClick={() => {
            setOpen(true);
          }}
        >
          {/* selectedUser가 있을 때만 렌더링 */}
          {selectedUser && (
            <>
              <UserName
                profile={{
                  nickname: selectedUser.nickname,
                  profileImageUrl: selectedUser.profileImageUrl,
                }}
              />
              <ArrowDropDownIcon className="w-5 h-5" />
            </>
          )}
        </button>
      ) : (
        <input
          type="text"
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setOpen(true);
          }}
          onFocus={() => setOpen(true)}
          placeholder={placeholder}
          className={`${baseStyle} outline-none text-gray-700 placeholder:text-gray-400`}
        />
      )}

      {/* 담당자 리스트 */}
      <DropdownList
        open={open}
        items={filteredMembers}
        onSelect={(user) => {
          setQuery(user.nickname);
          setOpen(false);
          setSelectedUser(user);
          onSelect?.(user.userId);
        }}
        getKey={(user) => user.userId}
        renderItem={(user) => <UserName profile={user} />}
        onClose={() => setOpen(false)}
        onClear={() => {
          setSelectedUser(null);
          setOpen(false);
          onSelect?.(null);
          setQuery('');
        }}
      />
    </div>
  );
}
