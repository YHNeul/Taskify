'use client';
/**
 * @file
 * @description
 *
 * ### 로직
 * 입력 → onChange → state 저장
 * → submit → createComments 호출
 * → interceptor가 토큰 자동 추가
 * → API 요청
 *
 * @author 수경
 */

import { Textarea } from '@/components/common/Input';
import { createComments } from '@/api/dashboard';
import { useState } from 'react';

interface CommentsProps {
  cardId: number;
  columnId: number;
  dashboardId: number;
  onSuccess: () => void;
}

export default function CommentsForm({
  cardId,
  columnId,
  dashboardId,
  onSuccess,
}: CommentsProps) {
  const [content, setContent] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!content.trim()) return;

    try {
      await createComments({
        content,
        cardId,
        columnId,
        dashboardId,
      });
      onSuccess();
      setContent('');
    } catch (error) {
      console.error('댓글 생성 실패', error);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <Textarea
        name="content"
        label="댓글"
        placeholder="댓글 작성하기"
        value={content}
        onChange={(e) => setContent(e.target.value)}
        buttonText="입력"
        buttonDisabled={!content.trim()}
      />
    </form>
  );
}
