'use client';
/**
 * @file ReplyItem.tsx
 * @description 할 일 카드 모달 내 댓글 리스트 컴포넌트입니다.
 *
 *
 * @author 수경
 *
 */

import UserProfileImage from '@/components/common/User/UserProfileImage';
import { Comments } from '@/types/dashboard';
import { updateComments } from '@/api/dashboard';
import { formatDateTime } from '@/utils/formatDate';
import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { getMe } from '@/api/auth';

interface Props {
  comment: Comments;
  onDeleteClick: (id: number) => void;
}

export default function ReplyItem({ comment, onDeleteClick }: Props) {
  /** 댓글 작성 id 비교 */
  const { data: me } = useQuery({
    queryKey: ['me'],
    queryFn: () => getMe(), // 현재 유저 조회 API
  });

  const isAuthor = me?.id === comment.author.id;

  const [isEditing, setIsEditing] = useState(false);
  const [editContent, setEditContent] = useState(comment.content);
  const [displayContent, setDisplayContent] = useState(comment.content);

  if (!comment) return null;
  const { id, author, createdAt } = comment;
  const formatted = formatDateTime(createdAt);

  /** 댓글 수정 */
  const handleEditConfirm = async () => {
    setIsEditing(false);

    try {
      await updateComments(id, editContent);
      setDisplayContent(editContent);
    } catch (error) {
      console.error('댓글 수정 실패', error);
      setEditContent(displayContent);
    }
  };

  return (
    <>
      <div className="flex items-start mt-4 gap-[10px]">
        <UserProfileImage profile={author} />
        <div className="flex flex-col gap-[6px] flex-1 pr-5">
          {/* 작성자 이름, 작성 날짜 */}
          <div className="flex items-center gap-2">
            <span className="text-md-semibold leading-4">
              {author.nickname}
            </span>
            <p className="text-gray-400 text-xs-regular">{formatted}</p>
          </div>
          {/* 댓글 내용 or 수정 input */}
          {isEditing ? (
            <input
              type="text"
              value={editContent}
              onChange={(e) => setEditContent(e.target.value)}
              className="w-full text-md-regular border border-gray-300 rounded px-2 py-1 outline-none bg-transparent"
              autoFocus
            />
          ) : (
            <div className="text-md-regular leading-4">{displayContent}</div>
          )}

          {/* 댓글 수정, 삭제 버튼 - 작성자만 표시 */}
          {isAuthor && (
            <div className="flex items-center gap-2 md:gap-[14px]">
              <button
                type="button"
                className="text-xs text-gray-400 underline underline-offset-2"
                onClick={() =>
                  isEditing ? handleEditConfirm() : setIsEditing(true)
                }
              >
                {isEditing ? '확인' : '수정'}
              </button>

              <button
                type="button"
                className="text-xs text-gray-400 underline underline-offset-2"
                onClick={() => onDeleteClick(id)}
              >
                삭제
              </button>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
