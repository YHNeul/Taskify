'use client';
/**
 * @file EditCard.tsx
 * @description 할 일 카드를 수정하는 모달 컴포넌트입니다.
 *
 * ### 할 일 수정 로직
 * 1. 부모로부터 카드 데이터 가져오기
 *    👉 GET /members API 호출 해서 멤버 리스트 가져오기
 *
 * @author 수경
 *
 */

import ModalBase from '@/shared/components/common/ModalBase';
import DropdownAssignee from '@/shared/components/common/Dropdown/DropdownAssignee';
import { Input, Textarea } from '@/shared/components/common/Input';
import ImageUploaderInput from '@/shared/components/common/Input/ImageUploaderInput';
import Button from '@/shared/components/common/Button';
import { useEffect, useRef, useState } from 'react';
import { Card, Column, Member } from '@/shared/types/dashboard';
import DateInput from '@/shared/components/common/Input/DateInput';
import DropdownProgress from '@/shared/components/common/Dropdown/DropdownProgress';
import ModalOverlay from '@/shared/components/common/ModalBase/ModalOverlay';
import {
  getMembers,
  updateCard,
  uploadCardImage,
} from '@/shared/apis/dashboard';
import { formatDateTime } from '@/shared/utils/formatDate';
import TagChip from '@/shared/components/common/Chip/TagChip';
import AlertModal from '@/shared/components/modal/AlertModal';
import Skeleton from '@/shared/components/common/Skeleton/Skeleton';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';

interface EditCardProps {
  cardData: Card;
  columns: Column[];
  columnTitle: string;
  onModalClose: () => void;
  onSuccess?: () => void;
}

const editCardSchema = z.object({
  title: z.string().trim().min(1, '제목을 입력해 주세요.'),
  description: z.string().trim().min(1, '설명을 입력해 주세요.'),
});

type EditCardFormValues = z.infer<typeof editCardSchema>;

function EditCardSkeleton({ onModalClose }: { onModalClose: () => void }) {
  return (
    <ModalOverlay onClose={onModalClose}>
      <ModalBase className="max-h-screen-minus-110 overflow-y-auto w-modal-card h-auto rounded-2xl text-gray-700 p-8 flex flex-col gap-8 mx-6 md:m-0">
        {/* 제목 */}
        <header>
          <Skeleton className="h-8 w-32 rounded-md" />
        </header>

        {/* 상태, 담당자 */}
        <div className="flex flex-col sm:flex-row gap-8">
          <div className="flex flex-col gap-2">
            <Skeleton className="h-5 w-10 rounded" />
            <Skeleton className="h-12 w-52 rounded-md" />
          </div>
          <div className="flex flex-col gap-2">
            <Skeleton className="h-5 w-16 rounded" />
            <Skeleton className="h-12 w-52 rounded-md" />
          </div>
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

export default function EditCard({
  cardData,
  columns,
  columnTitle,
  onModalClose,
  onSuccess,
}: EditCardProps) {
  /** 원본 데이터(비교용) */
  const initialData = useRef<Card>({
    ...cardData,
    tags: [...(cardData.tags ?? [])],
  });

  const [title, setTitle] = useState(cardData.title);
  const [description, setDescription] = useState(cardData.description);
  const [columnId, setColumnId] = useState(cardData.columnId);
  const [dueDate, setDueDate] = useState<string | null>(cardData.dueDate);
  const [tags, setTags] = useState<string[]>([...(cardData.tags ?? [])]);
  const [assignee, setAssignee] = useState(cardData.assignee);
  const [isMembersLoading, setIsMembersLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [members, setMembers] = useState<Member[]>([]);
  const [selectedMemberId, setSelectedMemberId] = useState<
    number | null | undefined
  >(undefined);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [isImageRemoved, setIsImageRemoved] = useState(false);
  const [tagInput, setTagInput] = useState('');
  const [isTagFocused, setIsTagFocused] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null); // API 호출 에러 처리

  const inputRef = useRef<HTMLInputElement>(null);
  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<EditCardFormValues>({
    resolver: zodResolver(editCardSchema),
    mode: 'onChange',
    defaultValues: {
      title: cardData.title,
      description: cardData.description,
    },
  });

  /** 변경된 필드만 감지 */
  const getChangedFields = () => {
    const initial = initialData.current;
    const changes: Record<string, unknown> = {};

    if (title !== initial.title) changes.title = title;

    if (description !== initial.description) changes.description = description;

    if (columnId !== initial.columnId) changes.columnId = columnId;

    if (dueDate !== initial.dueDate) changes.dueDate = dueDate ?? undefined;

    if (JSON.stringify(tags) !== JSON.stringify(initial.tags))
      changes.tags = tags;
    if (
      selectedMemberId !== undefined &&
      selectedMemberId !== initial.assignee?.id
    )
      changes.assigneeUserId = selectedMemberId;
    if (imageFile || isImageRemoved) changes.imageUrl = true; // 이미지는 업로드 후 처리

    return changes;
  };

  /** 변경 여부 */
  const isDirty =
    Object.keys(getChangedFields()).length > 0 ||
    imageFile !== null ||
    isImageRemoved;

  /** 멤버 목록 조회 */
  useEffect(() => {
    const fetchMembers = async () => {
      setIsMembersLoading(true);
      try {
        const data = await getMembers(cardData.dashboardId);
        setMembers(data.members);
      } catch (error) {
        console.error('멤버 조회 실패', error);
        setErrorMessage('멤버 조회에 문제가 발생했습니다.');
      } finally {
        setIsMembersLoading(false);
      }
    };
    fetchMembers();
  }, [cardData.dashboardId]);

  const onSubmit = async ({ title, description }: EditCardFormValues) => {
    // 변경된 내용 없으면 제출 방지
    if (!isDirty) return;

    const changedFields = getChangedFields();
    setIsSubmitting(true);
    try {
      // 1️⃣ 이미지 변경된 경우에만 업로드
      let imageUrl: string | null;
      if (imageFile) {
        // 새 이미지 업로드
        imageUrl = (await uploadCardImage(columnId, imageFile)).imageUrl;
      } else if (isImageRemoved) {
        // 이미지 삭제 → undefined 전송
        imageUrl = null;
      } else {
        // 변경 없음 → 기존 유지
        imageUrl = cardData.imageUrl ?? null;
      }

      // 2️⃣ 카드 수정 APi 호출 - 변경된 필드만 추출해서 전송
      await updateCard(cardData.id, {
        columnId: (changedFields.columnId as number) ?? cardData.columnId,
        title: (changedFields.title as string) ?? title,
        description: (changedFields.description as string) ?? description,
        tags: (changedFields.tags as string[]) ?? cardData.tags,
        assigneeUserId:
          'assigneeUserId' in changedFields
            ? (changedFields.assigneeUserId as number | null)
            : (cardData.assignee?.id ?? null),
        dueDate:
          'dueDate' in changedFields
            ? (changedFields.dueDate as string)
            : (cardData.dueDate ?? undefined),
        imageUrl,
      });
      onSuccess?.();
      onModalClose();
      console.log('수정 완료');
    } catch (error) {
      console.error('카드 수정 실패', error);
      setErrorMessage('카드 수정에 문제가 발생했습니다.');
    } finally {
      setIsSubmitting(false);
    }
  };

  /** 태그 추가 */
  const handleTagKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      if (e.nativeEvent.isComposing) return;
      const value = tagInput.trim();
      if (!value) return;
      setTags((prev) => [...prev, value]);
      setTagInput('');
    }
  };

  /** 태그 제거 */
  const handleTagRemove = (index: number) => {
    setTags((prev) => prev.filter((_, i) => i !== index));
  };

  if (isMembersLoading) return <EditCardSkeleton onModalClose={onModalClose} />;

  const baseFontStyle = 'text-2lg-medium mb-2';

  return (
    <ModalOverlay onClose={onModalClose}>
      <ModalBase className="px-4 mobile:px-8 max-h-screen-minus-160 overflow-y-auto w-modal-card h-auto rounded-2xl text-gray-700 p-8 flex flex-col gap-8">
        <header>
          <h2 className="text-2xl-bold break-words">할 일 수정</h2>
        </header>

        <form className="contents" onSubmit={handleSubmit(onSubmit)} noValidate>
          <div className="flex flex-col sm:flex-row gap-8">
            {/* 진행 상태 */}
            <div>
              <p className={baseFontStyle}>상태</p>
              <DropdownProgress
                columns={columns}
                columnTitle={columnTitle}
                onChange={(status) => setColumnId(status.id)}
              />
            </div>
            {/* 담당자 */}
            <div>
              <p className={baseFontStyle}>담당자</p>
              <DropdownAssignee
                members={members}
                defaultAssignee={assignee}
                onSelect={(id) => {
                  setSelectedMemberId(id);
                  setAssignee(
                    id === null
                      ? null
                      : members.find((member) => member.userId === id)
                        ? {
                            id,
                            nickname:
                              members.find((member) => member.userId === id)
                                ?.nickname ?? '',
                            profileImageUrl:
                              members.find((member) => member.userId === id)
                                ?.profileImageUrl ?? null,
                          }
                        : null,
                  );
                }}
              />
            </div>
          </div>

          {/* 제목 */}
          <Input
            label="제목"
            placeholder="제목을 입력해 주세요"
            required
            {...register('title')}
            value={title}
            onChange={(e) => {
              setTitle(e.target.value);
              setValue('title', e.target.value, {
                shouldDirty: true,
                shouldValidate: true,
              });
            }}
            isError={!!errors.title}
            errorMessage={errors.title?.message}
          />

          {/* 설명 */}
          <Textarea
            label="설명"
            placeholder="설명을 입력해 주세요"
            required
            {...register('description')}
            value={description}
            onChange={(e) => {
              setDescription(e.target.value);
              setValue('description', e.target.value, {
                shouldDirty: true,
                shouldValidate: true,
              });
            }}
            isError={!!errors.description}
            errorMessage={errors.description?.message}
          />

          {/* 마감일 */}
          <DateInput
            defaultDate={dueDate}
            fontStyle={baseFontStyle}
            onDateChange={(date) =>
              setDueDate(date ? formatDateTime(date.toISOString()) : null)
            }
          />

          {/* 태그 */}
          <div>
            <p className={baseFontStyle}>태그</p>
            <div
              className={`flex flex-wrap gap-1 items-center w-full min-h-12 px-4 py-2 text-sm rounded-md border cursor-text outline-none transition ${
                isTagFocused ? 'border-brand-violet' : 'border-gray-300'
              }`}
              onClick={() => inputRef.current?.focus()}
            >
              {tags.map((tag, index) => (
                <TagChip
                  key={index}
                  label={tag}
                  onClick={() => handleTagRemove(index)}
                  className="cursor-pointer"
                />
              ))}
              <input
                ref={inputRef}
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                onKeyDown={handleTagKeyDown}
                onFocus={() => setIsTagFocused(true)}
                onBlur={() => setIsTagFocused(false)}
                className="bg-transparent outline-none flex-1 min-w-20 text-gray-700"
                placeholder={tags.length === 0 ? '태그 입력 후 Enter' : ''}
              />
            </div>
          </div>

          {/* 이미지 */}
          <div>
            <p className={baseFontStyle}>이미지</p>
            <ImageUploaderInput
              onUpload={(file) => {
                setImageFile(file);
                setIsImageRemoved(!file);
              }}
              defaultUrl={cardData.imageUrl}
            />
          </div>

          {/* 버튼 */}
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
              disabled={
                isSubmitting || !isDirty || !title.trim() || !description.trim()
              } // 변경 없으면 비활성화
            >
              {isSubmitting ? '수정 중...' : '수정'}
            </Button>
          </div>
        </form>
      </ModalBase>

      {/* API 호출 에러 처리 */}
      {errorMessage && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70">
          <AlertModal
            message={errorMessage}
            onConfirm={() => setErrorMessage(null)}
          />
        </div>
      )}
    </ModalOverlay>
  );
}
