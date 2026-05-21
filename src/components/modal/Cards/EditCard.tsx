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

import ModalBase from '@/components/common/ModalBase';
import DropdownAssignee from '@/components/common/Dropdown/DropdownAssignee';
import { Input, Textarea } from '@/components/common/Input';
import ImageUploaderInput from '@/components/common/Input/ImageUploaderInput';
import Button from '@/components/common/Button';
import { useEffect, useRef, useState } from 'react';
import { Card, Column, Member } from '@/types/dashboard';
import DateInput from '@/components/common/Input/DateInput';
import DropdownProgress from '@/components/common/Dropdown/DropdownProgress';
import ModalOverlay from '@/components/common/ModalBase/ModalOverlay';
import { getMembers, updateCard, uploadCardImage } from '@/api/dashboard';
import { formatDateTime } from '@/utils/formatDate';
import TagChip from '@/components/common/Chip/TagChip';
import AlertModal from '../AlertModal';
import Skeleton from '@/components/common/Skeleton/Skeleton';

interface EditCardProps {
  cardData: Card;
  columns: Column[];
  columnTitle: string;
  onModalClose: () => void;
  onSuccess?: () => void;
}

function EditCardSkeleton({ onModalClose }: { onModalClose: () => void }) {
  return (
    <ModalOverlay onClose={onModalClose}>
      <ModalBase className="max-h-[calc(100vh-110px)] overflow-y-auto w-[584px] h-auto rounded-2xl text-gray-700 p-8 flex flex-col gap-8 mx-6 md:m-0">
        {/* 제목 */}
        <header>
          <Skeleton className="h-8 w-32 rounded-md" />
        </header>

        {/* 상태, 담당자 */}
        <div className="flex flex-col sm:flex-row gap-8">
          <div className="flex flex-col gap-2">
            <Skeleton className="h-5 w-10 rounded" />
            <Skeleton className="h-[48px] w-[217px] rounded-md" />
          </div>
          <div className="flex flex-col gap-2">
            <Skeleton className="h-5 w-16 rounded" />
            <Skeleton className="h-[48px] w-[217px] rounded-md" />
          </div>
        </div>

        {/* 제목 */}
        <div className="flex flex-col gap-2">
          <Skeleton className="h-5 w-12 rounded" />
          <Skeleton className="h-[48px] w-full rounded-md" />
        </div>

        {/* 설명 */}
        <div className="flex flex-col gap-2">
          <Skeleton className="h-5 w-12 rounded" />
          <Skeleton className="h-[96px] w-full rounded-md" />
        </div>

        {/* 마감일 */}
        <div className="flex flex-col gap-2">
          <Skeleton className="h-5 w-16 rounded" />
          <Skeleton className="h-[48px] w-full rounded-md" />
        </div>

        {/* 태그 */}
        <div className="flex flex-col gap-2">
          <Skeleton className="h-5 w-10 rounded" />
          <Skeleton className="h-[50px] w-full rounded-md" />
        </div>

        {/* 이미지 */}
        <div className="flex flex-col gap-2">
          <Skeleton className="h-5 w-12 rounded" />
          <Skeleton className="h-[76px] w-[76px] rounded-md" />
        </div>

        {/* 버튼 */}
        <div className="flex gap-2 h-[54px]">
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

  const [formData, setFormData] = useState<Card>({
    ...cardData,
    tags: [...(cardData.tags ?? [])],
  });
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

  /** 변경된 필드만 감지 */
  const getChangedFields = () => {
    const initial = initialData.current;
    const changes: Record<string, unknown> = {};

    if (formData.title !== initial.title) changes.title = formData.title;

    if (formData.description !== initial.description)
      changes.description = formData.description;

    if (formData.columnId !== initial.columnId)
      changes.columnId = formData.columnId;

    if (formData.dueDate !== initial.dueDate)
      changes.dueDate = formData.dueDate ?? undefined;

    if (JSON.stringify(formData.tags) !== JSON.stringify(initial.tags))
      changes.tags = formData.tags;
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

  const handleSubmit = async () => {
    // 변경된 내용 없으면 제출 방지
    if (!isDirty) return;

    const changedFields = getChangedFields();
    setIsSubmitting(true);
    try {
      // 1️⃣ 이미지 변경된 경우에만 업로드
      let imageUrl: string | null;
      if (imageFile) {
        // 새 이미지 업로드
        imageUrl = (await uploadCardImage(formData.columnId, imageFile))
          .imageUrl;
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
        title: (changedFields.title as string) ?? cardData.title,
        description:
          (changedFields.description as string) ?? cardData.description,
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
      setFormData((prev) => ({ ...prev, tags: [...prev.tags, value] }));
      setTagInput('');
    }
  };

  /** 태그 제거 */
  const handleTagRemove = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      tags: prev.tags.filter((_, i) => i !== index),
    }));
  };

  if (isMembersLoading) return <EditCardSkeleton onModalClose={onModalClose} />;

  const baseFontStyle = 'text-2lg-medium mb-2';

  return (
    <ModalOverlay onClose={onModalClose}>
      <ModalBase className="px-4 mobile:px-[30px] max-h-[calc(100vh-160px)] overflow-y-auto w-[584px] h-auto rounded-2xl text-gray-700 p-8 flex flex-col gap-8">
        <header>
          <h2 className="text-2xl-bold break-words">할 일 수정</h2>
        </header>

        <div className="flex flex-col sm:flex-row gap-8">
          {/* 진행 상태 */}
          <div>
            <p className={baseFontStyle}>상태</p>
            <DropdownProgress
              columns={columns}
              columnTitle={columnTitle}
              onChange={(status) =>
                setFormData((prev) => ({ ...prev, columnId: status.id }))
              }
            />
          </div>
          {/* 담당자 */}
          <div>
            <p className={baseFontStyle}>담당자</p>
            <DropdownAssignee
              members={members}
              defaultAssignee={formData.assignee}
              onSelect={(id) => setSelectedMemberId(id)}
            />
          </div>
        </div>

        {/* 제목 */}
        <Input
          label="제목"
          placeholder="제목을 입력해 주세요"
          required
          value={formData.title}
          onChange={(e) =>
            setFormData((prev) => ({ ...prev, title: e.target.value }))
          }
        />

        {/* 설명 */}
        <Textarea
          label="설명"
          placeholder="설명을 입력해 주세요"
          required
          value={formData.description}
          onChange={(e) =>
            setFormData((prev) => ({ ...prev, description: e.target.value }))
          }
        />

        {/* 마감일 */}
        <DateInput
          defaultDate={formData.dueDate}
          fontStyle={baseFontStyle}
          onDateChange={(date) =>
            setFormData((prev) => ({
              ...prev,
              dueDate: date ? formatDateTime(date.toISOString()) : null,
            }))
          }
        />

        {/* 태그 */}
        <div>
          <p className={baseFontStyle}>태그</p>
          <div
            className={`flex flex-wrap gap-1 items-center w-full min-h-[50px] px-4 py-2 text-sm rounded-md border cursor-text outline-none transition ${
              isTagFocused ? 'border-brand-violet' : 'border-gray-300'
            }`}
            onClick={() => inputRef.current?.focus()}
          >
            {formData.tags.map((tag, index) => (
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
              className="bg-transparent outline-none flex-1 min-w-[80px] text-gray-700"
              placeholder={
                formData.tags.length === 0 ? '태그 입력 후 Enter' : ''
              }
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
        <div className="relative flex items-stretch gap-2 h-[54px]">
          <Button variant="secondary" className="flex-1" onClick={onModalClose}>
            취소
          </Button>
          <Button
            variant="primary"
            className="flex-1"
            onClick={handleSubmit}
            disabled={
              isSubmitting ||
              !isDirty ||
              !formData.title ||
              !formData.description
            } // 변경 없으면 비활성화
          >
            {isSubmitting ? '수정 중...' : '수정'}
          </Button>
        </div>
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
