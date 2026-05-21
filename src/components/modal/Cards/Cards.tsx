'use client';
/**
 * @file Cards.tsx
 * @description 할 일 카드 모달 컴포넌트입니다.
 *
 * ### 호출되는 API
 * 1. 카드 상세 조회 API
 * 2. 컬럼 목록 조회 API → 컬럼명 가져오기 위해서
 * 2. 댓글 API
 *
 * ### 컴포넌트 흐름
 * - 케밥 드롭다운 버튼
 * 1. 수정하기 버튼 클릭 → EditCard 컴포넌트 렌더링, setIsEditing을 true로
 * 2. 삭제하기 버튼 클릭 → ConfirmModal 렌더링, setIsDeleting을 true로
 *
 * - X 닫기 버튼
 * 1. onModalClose로 모달 닫아짐
 *
 * - 댓글 버튼
 * 1. 수정/삭제
 * 2. 10개 이상 시 스크롤 바닥 도달 → 자동으로 다음 댓글 로드 (무한 스크롤)
 *
 * @author 수경
 *
 */

import StatusChip from '../../common/Chip/StatusChip';
import TagChip from '../../common/Chip/TagChip';
import KebabMenuIcon from '../../common/Icon/KebabMenuIcon';
import DropdownMenu from '../../common/Dropdown/DropdownMenu';
import { useEffect, useRef, useState } from 'react';
import type { Card } from '@/types/dashboard';
import AssigneeItem from './AssigneeItem';
import ReplyItem from './ReplyItem';
import Image from 'next/image';
import ModalBase from '@/components/common/ModalBase';
import EditCard from './EditCard';
import ModalOverlay from '@/components/common/ModalBase/ModalOverlay';
import { useDropdownClose } from '@/hooks/useToggle';
import CommentsForm from './CommentsForm';
import AlertModal from '../AlertModal';
import Button from '@/components/common/Button';
import useComments from '@/hooks/useComments';
import useCardData from '@/hooks/useCardData';
import CardSkeleton from './CardSkeleton';

interface CardsProps {
  onModalClose: () => void;
  cardId: number;
  dashboardId: number;
}

interface ConfirmModalProps {
  message: string;
  onCancel: () => void;
  onConfirm: () => void;
}

function DeleteConfirmModal({
  message,
  onCancel,
  onConfirm,
}: ConfirmModalProps) {
  return (
    <ModalBase className="w-screen mobile:w-[400px] rounded-[16px] p-[24px]">
      <p className="mb-[24px] text-center text-lg-medium text-gray-700">
        {message}
      </p>

      <div className="flex gap-[14px] flex-col mobile:flex-row">
        <Button
          variant="secondary"
          size="modal_sm"
          onClick={onCancel}
          className="w-auto mobile:flex-1"
        >
          취소
        </Button>

        <Button
          variant="primary"
          size="modal_sm"
          onClick={onConfirm}
          className="w-auto mobile:flex-1"
        >
          삭제
        </Button>
      </div>
    </ModalBase>
  );
}

export default function Cards({
  onModalClose,
  cardId,
  dashboardId,
}: CardsProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState<boolean>(false); // 드롭다운 열림 상태

  const handleCloseMenu = () => setIsMenuOpen(false);
  const menuRef = useDropdownClose(handleCloseMenu); // 드롭다운 외부 클릭 시 닫기 구현

  const {
    card,
    isLoading,
    isError,
    columns,
    columnTitle,
    errorMessage: cardError,
    setErrorMessage: setCardError,
    handleDeleteCard,
    handleEditSuccess,
  } = useCardData(cardId, dashboardId);

  const {
    commentsList,
    hasMore,
    isFetchingMore,
    errorMessage: commentError,
    setErrorMessage: setCommentError,
    deletingCommentId,
    setDeletingCommentId,
    sentinelRef,
    scrollContainerRef,
    resetAndFetch,
    handleDeleteCommentConfirm,
    COMMENTS_SIZE,
  } = useComments(cardId);

  const errorMessage = cardError ?? commentError;
  const clearError = () => {
    setCardError(null);
    setCommentError(null);
  };

  const modalRef = useRef<HTMLDivElement>(null);

  /** 모달 열릴 때 스크롤 상단 초기화 */
  useEffect(() => {
    modalRef.current?.scrollTo({ top: 0 });
  }, []);

  /** 렌더링 분기 */
  if (isLoading || isError) return <CardSkeleton onModalClose={onModalClose} />;
  if (!card) return null;

  const { title, description, tags, dueDate, assignee, imageUrl } =
    card as Card;

  /** 수정 모달 렌더링 */
  if (isEditing) {
    return (
      <EditCard
        cardData={card}
        columns={columns}
        columnTitle={columnTitle}
        onModalClose={onModalClose}
        onSuccess={handleEditSuccess}
      />
    );
  }

  return (
    <>
      <ModalOverlay onClose={onModalClose}>
        <ModalBase
          ref={modalRef}
          className="px-4 mobile:px-[30px] py-6 relative w-full md:w-fit max-h-[calc(100vh-160px)] overflow-y-auto flex flex-col md:flex-row-reverse md:gap-[14px] gap-4 text-gray-700 rounded-lg"
        >
          {/* 우측 영역 - 메뉴, 닫기 버튼, 담당자 */}
          <div className="flex flex-col items-end gap-6 min-w-[200px] w-full">
            <div className="flex gap-2 md:gap-6 relative">
              {/* 메뉴 */}
              <button onClick={() => setIsMenuOpen((prev) => !prev)}>
                <KebabMenuIcon width={22} className="w-7 aspect-square" />
              </button>

              {/* 드롭다운 메뉴 */}
              {isMenuOpen && (
                <div className="absolute top-8 right-[53px]" ref={menuRef}>
                  <DropdownMenu
                    onEdit={() => {
                      setIsEditing(true);
                      handleCloseMenu();
                    }}
                    onDelete={() => setIsDeleting(true)}
                  />
                </div>
              )}

              {/* 모달 닫기 버튼 */}
              <button onClick={onModalClose}>
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                  className="w-7 aspect-square"
                >
                  <path
                    d="M17 7L7 17"
                    stroke="#333236"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                  />
                  <path
                    d="M7 7L17 17"
                    stroke="#333236"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                  />
                </svg>
              </button>
            </div>

            {/* 담당자 컴포넌트 - 데스크탑 */}
            <div className="hidden md:block">
              <AssigneeItem assignee={assignee} dueDate={dueDate} />
            </div>
          </div>

          {/* 좌측 영역 - 제목, 진행 상태 및 태그, 내용, 댓글 */}
          <div className="flex flex-col md:max-w-[450px] md:min-w-[450px]">
            {/* 제목 */}
            <header className="mb-2 md:mb-6">
              <h2 className="text-2xl-bold break-words">{title}</h2>
            </header>

            {/* 담당자 컴포넌트 - 모바일용 */}
            <div className="md:hidden mb-4">
              <AssigneeItem assignee={assignee} dueDate={dueDate} />
            </div>

            {/* 진행 상태 및 태그 */}
            <div className="flex items-center mb-4 md:mb-[17px] h-8">
              {/* 진행 상태 */}
              <div className="w-fit max-w-[140px] mr-5">
                <StatusChip status={columnTitle} />
              </div>
              {/* 구분선 */}
              <div className="w-[1px] h-5 bg-gray-300 mr-5"></div>
              {/* 태그 */}
              <div className="flex items-center gap-[6px] overflow-x-auto">
                {tags.map((tag) => {
                  return (
                    <div key={tag}>
                      <TagChip label={tag} className={'w-max'} />
                    </div>
                  );
                })}
              </div>
            </div>

            {/* 설명 */}
            <p className="box-content min-h-[100px] p-[10px] mb-8 md:mb-2 text-md-regular">
              {description}
            </p>

            {/* 이미지 섹션: 이미지가 있을 때만 렌더링 */}
            {imageUrl && (
              <div className="relative w-full md:w-[445px] mb-6 md:mb-4">
                <Image
                  src={imageUrl}
                  alt="할 일 카드 이미지"
                  width={445}
                  height={0}
                  style={{ width: '100%', height: 'auto' }}
                  className="rounded-md"
                  unoptimized
                />
              </div>
            )}

            {/* 댓글 섹션 */}
            <section className="flex flex-col">
              {/* 댓글 인풋 */}
              <CommentsForm
                cardId={cardId}
                columnId={card.columnId}
                dashboardId={card.dashboardId}
                onSuccess={resetAndFetch}
              />
              {/* ──────────────────────────────────────────
                  댓글 리스트 (무한 스크롤)
                  - scrollContainerRef: IntersectionObserver의 root
                  - sentinelRef 목록 끝에 위치, 화면에 진입하면 다음 페이지 로드
              ────────────────────────────────────────── */}
              <div
                ref={scrollContainerRef}
                className="max-h-[80px] mb-0 mt-4 md:mb-6 md:mt-6 overflow-y-auto [&::-webkit-scrollbar]:w-1.5 [&::-webkit-scrollbar-track]:bg-gray-300 [&::-webkit-scrollbar-thumb]:bg-gray-400 [&::-webkit-scrollbar-thumb]:rounded-full"
              >
                {commentsList.length > 0 ? (
                  <>
                    {commentsList.map((comment) => (
                      <ReplyItem
                        key={comment.id}
                        comment={comment}
                        onDeleteClick={setDeletingCommentId}
                      />
                    ))}

                    {/* sentinel: 스크롤 끝에 도달하면 다음 페이지 자동 로드 */}
                    <div ref={sentinelRef} className="h-4" />

                    {/* 추가 로딩 인디케이터 */}
                    {isFetchingMore && (
                      <p className="text-md-medium text-gray-400 text-center py-2">
                        불러오는 중...
                      </p>
                    )}

                    {/* 마지막 페이지 안내 (10개 이상일 때만 노출) */}
                    {!hasMore && commentsList.length >= COMMENTS_SIZE && (
                      <p className="text-md-medium text-gray-400 text-center py-2">
                        모든 댓글을 불러왔습니다.
                      </p>
                    )}
                  </>
                ) : (
                  <div className="text-md-medium text-gray-400 text-center py-2">
                    댓글이 없습니다.
                  </div>
                )}
              </div>
            </section>
          </div>
        </ModalBase>
        {/* 카드 삭제 확인 모달 */}
        {isDeleting && (
          <ModalOverlay onClose={() => setIsDeleting(false)}>
            <DeleteConfirmModal
              message="정말 카드를 삭제하겠습니까?"
              onCancel={() => setIsDeleting(false)}
              onConfirm={() => handleDeleteCard(onModalClose)}
            />
          </ModalOverlay>
        )}

        {/* 댓글 삭제확인 모달 */}
        {deletingCommentId && (
          <ModalOverlay onClose={() => setIsDeleting(false)}>
            <DeleteConfirmModal
              message="정말 댓글을 삭제하겠습니까?"
              onCancel={() => setDeletingCommentId(null)}
              onConfirm={handleDeleteCommentConfirm}
            />
            {/* </div> */}
          </ModalOverlay>
        )}

        {/* API 호출 에러 처리 */}
        {errorMessage && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70">
            <AlertModal message={errorMessage} onConfirm={clearError} />
          </div>
        )}
      </ModalOverlay>
    </>
  );
}
