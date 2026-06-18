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

import StatusChip from '@/shared/components/common/Chip/StatusChip';
import TagChip from '@/shared/components/common/Chip/TagChip';
import KebabMenuIcon from '@/shared/components/common/Icon/KebabMenuIcon';
import DropdownMenu from '@/shared/components/common/Dropdown/DropdownMenu';
import { useEffect, useRef, useState } from 'react';
import dynamic from 'next/dynamic';
import type { Card } from '@/shared/types/dashboard';
import AssigneeItem from '@/shared/components/modal/Cards/AssigneeItem';
import ReplyItem from '@/shared/components/modal/Cards/ReplyItem';
import ModalBase from '@/shared/components/common/ModalBase';
import ModalOverlay from '@/shared/components/common/ModalBase/ModalOverlay';
import { useDropdownClose } from '@/shared/hooks/useToggle';
import CommentsForm from '@/shared/components/modal/Cards/CommentsForm';
import AlertModal from '@/shared/components/modal/AlertModal';
import Button from '@/shared/components/common/Button';
import { useComments } from '@/shared/hooks/useComments';
import { useCardData } from '@/shared/hooks/useCardData';
import CardSkeleton from '@/shared/components/modal/Cards/CardSkeleton';
import OptimizedImageWithFallback from '@/shared/components/common/Image/OptimizedImageWithFallback';

const EditCard = dynamic(
  () => import('@/shared/components/modal/Cards/EditCard'),
);
const ImageLightboxModal = dynamic(
  () => import('@/shared/components/modal/Cards/ImageLightboxModal'),
);

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
    <ModalBase className="w-screen mobile:w-full mobile:max-w-sm rounded-2xl p-6">
      <p className="mb-6 text-center typo-lg-medium text-gray-700">{message}</p>

      <div className="flex gap-3.5 flex-col mobile:flex-row">
        <Button
          variant="secondary"
          size="md"
          onClick={onCancel}
          className="h-10 w-auto mobile:flex-1"
        >
          취소
        </Button>

        <Button
          variant="primary"
          size="md"
          onClick={onConfirm}
          className="h-10 w-auto mobile:flex-1"
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
  const [isImageDetailOpen, setIsImageDetailOpen] = useState(false);
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
          className="px-4 mobile:px-8 py-6 relative w-full md:w-fit md:min-w-card-detail-content max-h-screen-minus-160 overflow-y-auto flex flex-col md:flex-row gap-4 md:gap-0 text-gray-700 rounded-card-sm"
        >
          {/* 우측 영역 - 메뉴, 닫기 버튼, 담당자/마감일 */}
          <aside className="order-1 md:order-2 flex flex-col items-start gap-6 min-w-50 w-full md:w-52 md:pl-4 md:border-l md:border-gray-200">
            <div className="self-end flex gap-1 md:gap-3 relative">
              <div className="relative" ref={menuRef}>
                {/* 메뉴 */}
                <button
                  type="button"
                  onClick={() => setIsMenuOpen((prev) => !prev)}
                  className="interactive-icon-btn cursor-pointer"
                >
                  <KebabMenuIcon width={22} className="w-7 aspect-square" />
                </button>

                {/* 드롭다운 메뉴 */}
                {isMenuOpen && (
                  <div className="absolute top-8 right-0">
                    <DropdownMenu
                      onEdit={() => {
                        setIsEditing(true);
                        handleCloseMenu();
                      }}
                      onDelete={() => {
                        setIsDeleting(true);
                        handleCloseMenu();
                      }}
                    />
                  </div>
                )}
              </div>

              {/* 모달 닫기 버튼 */}
              <button
                type="button"
                onClick={onModalClose}
                className="interactive-icon-btn cursor-pointer"
              >
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
            <div className="hidden md:block w-full">
              <AssigneeItem assignee={assignee} dueDate={dueDate} />
            </div>
          </aside>

          {/* 좌측 영역 - 제목, 진행 상태 및 태그, 내용, 댓글 */}
          <div className="order-2 md:order-1 flex flex-col md:w-content-450 md:shrink-0 md:pr-4">
            {/* 제목 */}
            <header className="mb-2 md:mb-6">
              <h2 className="typo-2xl-bold wrap-break-word">{title}</h2>
            </header>

            {/* 담당자 컴포넌트 - 모바일용 */}
            <div className="md:hidden mb-4">
              <AssigneeItem assignee={assignee} dueDate={dueDate} />
            </div>

            {/* 진행 상태 및 태그 */}
            <div className="flex items-center mb-4 md:mb-17 h-8">
              {/* 진행 상태 */}
              <div className="w-fit max-w-36 mr-5">
                <StatusChip status={columnTitle} />
              </div>
              {/* 구분선 */}
              <div className="w-px h-5 bg-gray-300 mr-5"></div>
              {/* 태그 */}
              <div className="flex items-center gap-1.5 overflow-x-auto">
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
            <p className="box-content min-h-24 p-2.5 mb-8 md:mb-2 typo-md-regular">
              {description}
            </p>

            {/* 이미지 섹션: 이미지가 있을 때만 렌더링 */}
            {imageUrl && (
              <button
                type="button"
                onClick={() => setIsImageDetailOpen(true)}
                className="relative mb-6 block w-full overflow-hidden rounded-md bg-gray-100 md:mb-4 aspect-video"
                aria-label="이미지 상세 보기 열기"
              >
                <OptimizedImageWithFallback
                  src={imageUrl}
                  alt="할 일 카드 이미지"
                  imageClassName="object-contain"
                  fallback={
                    <div className="flex h-full w-full items-center justify-center bg-gray-100 typo-sm-medium text-gray-400">
                      이미지를 불러올 수 없습니다.
                    </div>
                  }
                  imageProps={{
                    fill: true,
                    loading: 'lazy',
                    sizes: '(max-width: 768px) calc(100vw - 32px), 445px',
                  }}
                />
              </button>
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
                className="max-h-20 mb-0 mt-4 md:mb-6 md:mt-6 overflow-y-auto"
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
                      <p className="typo-md-medium text-gray-400 text-center py-2">
                        불러오는 중...
                      </p>
                    )}

                    {/* 마지막 페이지 안내 (10개 이상일 때만 노출) */}
                    {!hasMore && commentsList.length >= COMMENTS_SIZE && (
                      <p className="typo-md-medium text-gray-400 text-center py-2">
                        모든 댓글을 불러왔습니다.
                      </p>
                    )}
                  </>
                ) : (
                  <div className="typo-md-medium text-gray-400 text-center py-2">
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
          <ModalOverlay onClose={() => setDeletingCommentId(null)}>
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

      {isImageDetailOpen && imageUrl && (
        <ImageLightboxModal
          imageUrl={imageUrl}
          alt="할 일 카드 이미지 상세"
          onClose={() => setIsImageDetailOpen(false)}
        />
      )}
    </>
  );
}
