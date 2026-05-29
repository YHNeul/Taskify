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

import { Textarea } from '@/shared/components/common/Input';
import { createComments } from '@/shared/apis/dashboard';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { z } from 'zod';

interface CommentsProps {
  cardId: number;
  columnId: number;
  dashboardId: number;
  onSuccess: () => void;
}

const commentsSchema = z.object({
  content: z
    .string()
    .trim()
    .min(1, '댓글을 입력해 주세요.')
    .max(500, '댓글은 500자 이하로 입력해 주세요.'),
});

type CommentsFormValues = z.infer<typeof commentsSchema>;

export default function CommentsForm({
  cardId,
  columnId,
  dashboardId,
  onSuccess,
}: CommentsProps) {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting, isValid },
  } = useForm<CommentsFormValues>({
    resolver: zodResolver(commentsSchema),
    mode: 'onChange',
    defaultValues: {
      content: '',
    },
  });

  const onSubmit = async ({ content }: CommentsFormValues) => {
    try {
      await createComments({
        content: content.trim(),
        cardId,
        columnId,
        dashboardId,
      });
      onSuccess();
      reset();
    } catch (error) {
      console.error('댓글 생성 실패', error);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate>
      <Textarea
        label="댓글"
        placeholder="댓글 작성하기"
        {...register('content')}
        isError={!!errors.content}
        errorMessage={errors.content?.message}
        buttonText="입력"
        buttonDisabled={!isValid || isSubmitting}
      />
    </form>
  );
}
