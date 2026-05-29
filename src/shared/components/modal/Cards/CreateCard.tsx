'use client';
/**
 * @file CreateCard.tsx
 * @description 할 일 카드를 생성하는 모달 컴포넌트입니다.
 *
 * ### 할 일 생성 로직
 * 1. GET /members API 호출
 * 2. 대시보드 멤버 목록 가져오기
 * 3. 인풋 입력 후 생성 버튼 클릭 시 POST /cards API 호출
 *
 * @author 수경
 *
 */

import ModalBase from '@/shared/components/common/ModalBase';
import DropdownAssignee from '@/shared/components/common/Dropdown/DropdownAssignee';
import { Input, Textarea } from '@/shared/components/common/Input';
import ImageUploaderInput from '@/shared/components/common/Input/ImageUploaderInput';
import Button from '@/shared/components/common/Button';
import { useRef, useState } from 'react';
import DateInput from '@/shared/components/common/Input/DateInput';
import ModalOverlay from '@/shared/components/common/ModalBase/ModalOverlay';
import { createCard, uploadCardImage } from '@/shared/apis/dashboard';
import { formatDateTime } from '@/shared/utils/formatDate';
import TagChip from '@/shared/components/common/Chip/TagChip';
import AlertModal from '@/shared/components/modal/AlertModal';
import Skeleton from '@/shared/components/common/Skeleton/Skeleton';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { QUERY_KEYS } from '@/shared/constants/queryKeys';
import { useDashboardMembersQuery } from '@/shared/hooks/useDashboardMembersQuery';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';

interface CreateCardExtraForm {
  tags: string[];
  dueDate: string | null;
}

const INITIAL_FORM: CreateCardExtraForm = {
  tags: [],
  dueDate: null,
};

const createCardSchema = z.object({
  title: z.string().trim().min(1, '제목을 입력해 주세요.'),
  description: z.string().trim().min(1, '설명을 입력해 주세요.'),
});

type CreateCardFormValues = z.infer<typeof createCardSchema>;

interface CreateCardProps {
  dashboardId: number;
  columnId: number;
  onModalClose: () => void;
}

function CreateCardSkeleton({ onModalClose }: { onModalClose: () => void }) {
  return (
    <ModalOverlay onClose={onModalClose}>
      <ModalBase className="max-h-screen-minus-110 overflow-y-auto w-modal-card h-auto rounded-2xl text-gray-700 p-8 flex flex-col gap-8 mx-6 md:m-0">
        <header>
          <Skeleton className="h-8 w-32 rounded-md" />
        </header>

        {/* 담당자 */}
        <div className="flex flex-col gap-2">
          <Skeleton className="h-5 w-16 rounded" />
          <Skeleton className="h-12 w-full rounded-md" />
        </div>

        {/* 제목 */}
        <div className="flex flex-col gap-2">
          <Skeleton className="h-5 w-12 rounded" />
          <Skeleton className="h-12 w-full rounded-md" />
        </div>

        {/* 설명 */}
        <div className="flex flex-col gap-2">
          <Skeleton className="h-5 w-12 rounded" />
          <Skeleton className="h-24 w-full rounded-md" />
        </div>

        {/* 마감일 */}
        <div className="flex flex-col gap-2">
          <Skeleton className="h-5 w-16 rounded" />
          <Skeleton className="h-12 w-full rounded-md" />
        </div>

        {/* 태그 */}
        <div className="flex flex-col gap-2">
          <Skeleton className="h-5 w-10 rounded" />
          <Skeleton className="h-12 w-full rounded-md" />
        </div>

        {/* 이미지 */}
        <div className="flex flex-col gap-2">
          <Skeleton className="h-5 w-12 rounded" />
          <Skeleton className="h-20 w-20 rounded-md" />
        </div>

        {/* 버튼 */}
        <div className="flex gap-2 h-14">
          <Skeleton className="flex-1 rounded-lg" />
          <Skeleton className="flex-1 rounded-lg" />
        </div>
      </ModalBase>
    </ModalOverlay>
  );
}

export default function CreateCard({
  dashboardId,
  columnId,
  onModalClose,
}: CreateCardProps) {
  const queryClient = useQueryClient();
  const [formData, setFormData] = useState<CreateCardExtraForm>(INITIAL_FORM);
  const [selectedMemberId, setSelectedMemberId] = useState<number | null>(null);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [tagInput, setTagInput] = useState('');
  const [isTagFocused, setIsTagFocused] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null); // API 호출 에러 처리
  const {
    register,
    handleSubmit,
    formState: { errors, isValid },
  } = useForm<CreateCardFormValues>({
    resolver: zodResolver(createCardSchema),
    mode: 'onChange',
    defaultValues: {
      title: '',
      description: '',
    },
  });

  /** 멤버 목록 조회 */
  const {
    data: membersData,
    isLoading: isMembersLoading,
    isError: isMembersError,
  } = useDashboardMembersQuery({
    dashboardId,
  });

  const members = membersData?.members ?? [];
  const resolvedErrorMessage =
    errorMessage ??
    (isMembersError ? '멤버 조회에 문제가 발생했습니다.' : null);

  /** 카드 생성 */
  const { mutate: submitCard, isPending: isSubmitting } = useMutation({
    mutationFn: async ({ title, description }: CreateCardFormValues) => {
      const imageUrl = imageFile
        ? (await uploadCardImage(columnId, imageFile)).imageUrl
        : undefined;

      return createCard({
        dashboardId,
        columnId,
        title: title.trim(),
        description: description.trim(),
        ...(selectedMemberId && { assigneeUserId: selectedMemberId }),
        ...(formData.tags.length > 0 && { tags: formData.tags }),
        ...(formData.dueDate && { dueDate: formData.dueDate }),
        ...(imageUrl && { imageUrl }),
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: [...QUERY_KEYS.columns(dashboardId), 'cards'],
      });
      onModalClose();
    },
    onError: () => {
      setErrorMessage('카드 생성에 문제가 발생했습니다.');
    },
  });

  const onSubmit = (values: CreateCardFormValues) => {
    submitCard(values);
  };

  const inputRef = useRef<HTMLInputElement>(null);

  /** 태그 입력 - Enter 키로 추가 */
  const handleTagKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      if (e.nativeEvent.isComposing) return; // ✅ 한글 조합 중이면 무시
      const value = tagInput.trim();
      if (!value) return;
      setFormData((prev) => ({ ...prev, tags: [...prev.tags, value] }));
      setTagInput('');
    }
  };
  const handleTagRemove = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      tags: prev.tags.filter((_, i) => i !== index),
    }));
  };

  if (isMembersLoading)
    return <CreateCardSkeleton onModalClose={onModalClose} />;

  /** 타이틀 공통 CSS */
  const baseFontStyle = 'text-2lg-medium mb-2';

  return (
    <>
      <ModalOverlay onClose={onModalClose}>
        <ModalBase className="px-4 mobile:px-8 max-h-screen-minus-160 overflow-y-auto w-modal-card h-auto rounded-2xl text-gray-700 p-8 flex flex-col gap-8">
          <header>
            <h2 className="text-2xl-bold wrap-break-word">할 일 생성</h2>
          </header>

          <form
            className="contents"
            onSubmit={handleSubmit(onSubmit)}
            noValidate
          >
            {/* 담당자 */}
            <div className="">
              <p className={`${baseFontStyle}`}>담당자</p>
              <DropdownAssignee
                members={members}
                onSelect={(id) => {
                  setSelectedMemberId(id);
                }}
              />
            </div>

            {/* 제목 */}
            <Input
              label="제목"
              placeholder="제목을 입력해 주세요"
              required={true}
              {...register('title')}
              isError={!!errors.title}
              errorMessage={errors.title?.message}
            />

            {/* 설명 */}
            <Textarea
              label="설명"
              placeholder="설명을 입력해 주세요"
              required={true}
              {...register('description')}
              isError={!!errors.description}
              errorMessage={errors.description?.message}
            />

            {/* 마감일 */}
            <DateInput
              fontStyle={baseFontStyle}
              onDateChange={(date) => {
                setFormData((prev) => ({
                  ...prev,
                  dueDate: date ? formatDateTime(date.toISOString()) : null,
                }));
              }}
            />

            {/* 태그 */}
            <div className="">
              <p className={`${baseFontStyle}`}>태그</p>
              <div
                className={`flex flex-wrap gap-1 items-center w-full min-h-12 px-4 py-2 text-sm rounded-md border cursor-text outline-none transition ${
                  isTagFocused ? 'border-brand-violet' : 'border-gray-300'
                }`}
                onClick={() => inputRef.current?.focus()}
              >
                {/* 저장된 태그칩 */}
                {formData.tags.map((tag, index) => (
                  <TagChip
                    key={index}
                    label={tag}
                    onClick={() => handleTagRemove(index)}
                    className="cursor-pointer"
                  />
                ))}

                {/* 실제 인풋 */}
                <input
                  ref={inputRef}
                  value={tagInput}
                  onChange={(e) => setTagInput(e.target.value)}
                  onKeyDown={handleTagKeyDown}
                  onFocus={() => setIsTagFocused(true)}
                  onBlur={() => setIsTagFocused(false)}
                  className="bg-transparent outline-none flex-1 min-w-20 text-gray-700 text-lg-regular"
                  placeholder={
                    formData.tags.length === 0 ? '태그 입력 후 Enter' : ''
                  }
                />
              </div>
            </div>

            {/* 이미지 */}
            <div>
              <p className={`${baseFontStyle}`}>이미지</p>
              <ImageUploaderInput onUpload={(file) => setImageFile(file)} />
            </div>

            {/* 생성,취소 버튼 */}
            <div className="relative flex items-stretch gap-2 h-14">
              <Button
                variant="secondary"
                className="flex-1"
                onClick={onModalClose}
              >
                취소
              </Button>
              <Button
                variant="primary"
                className="flex-1"
                type="submit"
                disabled={isSubmitting || !isValid}
              >
                {isSubmitting ? '생성 중...' : '생성'}
              </Button>
            </div>
          </form>
        </ModalBase>

        {/* API 호출 에러 처리 */}
        {resolvedErrorMessage && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70">
            <AlertModal
              message={resolvedErrorMessage}
              onConfirm={() => setErrorMessage(null)}
            />
          </div>
        )}
      </ModalOverlay>
    </>
  );
}
