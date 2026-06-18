'use client';
/**
 * @file ReplyItem.tsx
 * @description 할 일 카드 모달 내 댓글 리스트 컴포넌트입니다.
 *
 *
 * @author 수경
 *
 */

import UserProfileImage from '@/shared/components/common/User/UserProfileImage';
import { Comments } from '@/shared/types/dashboard';
import { updateComments } from '@/shared/apis/dashboard';
import { formatDateTime } from '@/shared/utils/formatDate';
import { useState } from 'react';
import { useMeQuery } from '@/shared/hooks/useMeQuery';

interface Props {
  comment: Comments;
  onDeleteClick: (id: number) => void;
}

export default function ReplyItem({ comment, onDeleteClick }: Props) {
  /** 댓글 작성 id 비교 */
  const { data: me } = useMeQuery();

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
      <div className="flex items-start mt-4 gap-2.5">
        <UserProfileImage profile={author} />
        <div className="flex flex-col gap-1.5 flex-1 pr-5">
          {/* 작성자 이름, 작성 날짜 */}
          <div className="flex items-center gap-2">
            <span className="typo-md-semibold leading-4">
              {author.nickname}
            </span>
            <p className="text-gray-400 typo-xs-regular">{formatted}</p>
          </div>
          {/* 댓글 내용 or 수정 input */}
          {isEditing ? (
            <input
              type="text"
              value={editContent}
              onChange={(e) => setEditContent(e.target.value)}
              className="w-full typo-md-regular border border-gray-300 rounded px-2 py-1 outline-none bg-transparent"
              autoFocus
            />
          ) : (
            <div className="typo-md-regular leading-4">{displayContent}</div>
          )}

          {/* 댓글 수정, 삭제 버튼 - 작성자만 표시 */}
          {isAuthor && (
            <div className="flex items-center gap-2 md:gap-3.5">
              <button
                type="button"
                className="text-xs text-gray-400 underline underline-offset-2 hover:text-gray-600 transition-colors"
                onClick={() =>
                  isEditing ? handleEditConfirm() : setIsEditing(true)
                }
              >
                {isEditing ? '확인' : '수정'}
              </button>

              <button
                type="button"
                className="text-xs text-gray-400 underline underline-offset-2 hover:text-gray-600 transition-colors"
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
