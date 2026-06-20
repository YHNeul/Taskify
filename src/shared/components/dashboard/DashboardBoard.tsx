'use client';

import { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import dynamic from 'next/dynamic';
import { useSearchParams } from 'next/navigation';
import { flushSync } from 'react-dom';
import { useQueryClient } from '@tanstack/react-query';
import { DndContext, DragOverlay, closestCenter } from '@dnd-kit/core';
import { useDashboardStore } from '@/shared/store/useDashboardStore';
import type { Column as ColumnType, Card } from '@/shared/types/dashboard';
import Column from '@/shared/components/dashboard/Column';
import TaskCard from '@/shared/components/dashboard/TaskCard';
import Button from '@/shared/components/common/Button';
import DashboardBoardSkeleton from '@/shared/components/dashboard/BoardSkeleton';
import { useBoardDnd, type ColumnCardState } from '@/shared/hooks/useBoardDnd';
import { applySavedOrder } from '@/shared/utils/cardOrder';
import { useDashboardQuery } from '@/shared/hooks/useDashboardQuery';
import { useDashboardColumnsQuery } from '@/shared/hooks/useDashboardColumnsQuery';
import { useDashboardColumnCardsQuery } from '@/shared/hooks/useDashboardColumnCardsQuery';
import { useDashboardColumnMutations } from '@/shared/hooks/useDashboardColumnMutations';
import { useColumnCardsPagination } from '@/shared/hooks/useColumnCardsPagination';
import { QUERY_PARAM_KEYS } from '@/shared/constants/queryParams.constants';
import { QUERY_KEYS } from '@/shared/constants/queryKeys';
import { readCard } from '@/shared/apis/dashboard';

const Cards = dynamic(() => import('@/shared/components/modal/Cards/Cards'));
const CreateCard = dynamic(
  () => import('@/shared/components/modal/Cards/CreateCard'),
);
const FormModal = dynamic(() => import('@/shared/components/modal/FormModal'));
const ConfirmModal = dynamic(
  () => import('@/shared/components/modal/ConfirmModal'),
);
const EMPTY_CARDS: Card[] = [];
const EMPTY_COLUMNS: ColumnType[] = [];
const PREFETCH_CARD_DETAIL_PER_COLUMN = 3;
const PREFETCH_CARD_DETAIL_TOTAL_LIMIT = 20;

const parseCardIdParam = (rawValue: string | null): number | null => {
  if (!rawValue) return null;
  const parsed = Number(rawValue);
  return Number.isFinite(parsed) && parsed > 0 ? Math.floor(parsed) : null;
};

interface DashboardBoardProps {
  dashboardId: number;
}

export default function DashboardBoard({ dashboardId }: DashboardBoardProps) {
  const queryClient = useQueryClient();
  const [columnCards, setColumnCards] = useState<
    Record<number, ColumnCardState>
  >({});
  const searchParams = useSearchParams();
  const [selectedCardId, setSelectedCardId] = useState<number | null>(null);
  const [createCardColumnId, setCreateCardColumnId] = useState<number | null>(
    null,
  );
  const [addColumnModal, setAddColumnModal] = useState({
    isOpen: false,
    title: '',
    error: '',
  });
  const [editColumnModal, setEditColumnModal] = useState<{
    column: ColumnType | null;
    title: string;
    error: string;
  }>({ column: null, title: '', error: '' });
  const [deleteColumnId, setDeleteColumnId] = useState<number | null>(null);
  const [boardErrorMessage, setBoardErrorMessage] = useState<string | null>(
    null,
  );
  const lastSyncedCardsVersionRef = useRef<string | null>(null);
  const hasInitializedCardParamRef = useRef(false);
  const prefetchedCardIdsRef = useRef<Set<number>>(new Set());

  const updateCardQueryParam = useCallback((cardId: number | null) => {
    const url = new URL(window.location.href);

    if (cardId === null) {
      url.searchParams.delete(QUERY_PARAM_KEYS.CARD_ID);
    } else {
      url.searchParams.set(QUERY_PARAM_KEYS.CARD_ID, String(cardId));
    }

    const nextPath = `${url.pathname}${url.search}${url.hash}`;
    window.history.replaceState(window.history.state, '', nextPath);
  }, []);

  const handleLoadMoreError = useCallback(() => {
    setBoardErrorMessage('카드를 더 불러오지 못했습니다. 다시 시도해 주세요.');
  }, []);

  const setActiveDashboardId = useDashboardStore((s) => s.setActiveDashboardId);
  const { createColumn, updateColumn, deleteColumn } =
    useDashboardColumnMutations({
      dashboardId,
      onDeleteError: () => {
        setBoardErrorMessage(
          '컬럼 삭제에 실패했습니다. 잠시 후 다시 시도해 주세요.',
        );
      },
    });
  const { loadingColumnIds, loadMoreCards } = useColumnCardsPagination({
    setColumnCards,
    onLoadMoreError: handleLoadMoreError,
  });

  useEffect(() => {
    setActiveDashboardId(dashboardId);
  }, [dashboardId, setActiveDashboardId]);

  useEffect(() => {
    const preloadModalChunks = () => {
      void import('@/shared/components/modal/Cards/Cards');
      void import('@/shared/components/modal/Cards/CreateCard');
      void import('@/shared/components/modal/Cards/EditCard');
    };

    if (typeof window.requestIdleCallback === 'function') {
      const idleId = window.requestIdleCallback(preloadModalChunks);
      return () => {
        window.cancelIdleCallback(idleId);
      };
    }

    const timeoutId = window.setTimeout(preloadModalChunks, 0);
    return () => window.clearTimeout(timeoutId);
  }, []);

  useEffect(() => {
    const nextCardId = parseCardIdParam(
      searchParams.get(QUERY_PARAM_KEYS.CARD_ID),
    );

    if (!hasInitializedCardParamRef.current) {
      setSelectedCardId(nextCardId);
      hasInitializedCardParamRef.current = true;
      return;
    }

    setSelectedCardId((prev) => (prev === nextCardId ? prev : nextCardId));
  }, [searchParams]);

  useEffect(() => {
    prefetchedCardIdsRef.current.clear();
  }, [dashboardId]);

  const { data: dashboard, isLoading: isDashboardLoading } =
    useDashboardQuery(dashboardId);

  const { data: columnsData, isLoading: isColumnsLoading } =
    useDashboardColumnsQuery(dashboardId);

  const columns = useMemo(
    () => columnsData?.data ?? EMPTY_COLUMNS,
    [columnsData],
  );
  const { data: columnCardsData, dataVersion } = useDashboardColumnCardsQuery({
    dashboardId,
    columns,
    size: 10,
  });

  useEffect(() => {
    if (!columnCardsData) return;
    if (lastSyncedCardsVersionRef.current === dataVersion) return;
    lastSyncedCardsVersionRef.current = dataVersion;

    setColumnCards((prev) => {
      const ordered: Record<number, ColumnCardState> = {};
      for (const [colId, state] of Object.entries(columnCardsData)) {
        const id = Number(colId);
        ordered[id] = { ...state, cards: applySavedOrder(id, state.cards) };
      }

      const prevKeys = Object.keys(prev);
      const nextKeys = Object.keys(ordered);
      if (prevKeys.length !== nextKeys.length) return ordered;

      const isSame = nextKeys.every((key) => {
        const id = Number(key);
        const prevState = prev[id];
        const nextState = ordered[id];
        if (!prevState) return false;
        if (
          prevState.totalCount !== nextState.totalCount ||
          prevState.cursorId !== nextState.cursorId
        ) {
          return false;
        }
        const prevCards = prevState.cards;
        const nextCards = nextState.cards;
        if (prevCards.length !== nextCards.length) return false;
        return prevCards.every(
          (card, index) =>
            card.id === nextCards[index].id &&
            card.updatedAt === nextCards[index].updatedAt,
        );
      });

      return isSame ? prev : ordered;
    });
  }, [columnCardsData, dataVersion]);

  useEffect(() => {
    const candidateCards = Object.values(columnCards)
      .flatMap((state) => state.cards.slice(0, PREFETCH_CARD_DETAIL_PER_COLUMN))
      .slice(0, PREFETCH_CARD_DETAIL_TOTAL_LIMIT);

    candidateCards.forEach((card) => {
      if (prefetchedCardIdsRef.current.has(card.id)) return;
      prefetchedCardIdsRef.current.add(card.id);

      void queryClient.prefetchQuery({
        queryKey: QUERY_KEYS.card(card.id),
        queryFn: () => readCard(card.id),
        staleTime: 1000 * 60 * 2,
      });
    });
  }, [columnCards, queryClient]);

  const {
    sensors,
    activeCard,
    handleDragStart,
    handleDragOver,
    handleDragEnd,
  } = useBoardDnd({
    columnCards,
    setColumnCards,
    onMovePersistError: () => {
      setBoardErrorMessage('카드 이동 저장에 실패해 이전 상태로 복구했습니다.');
    },
  });

  useEffect(() => {
    if (!boardErrorMessage) return;

    const timerId = window.setTimeout(() => {
      setBoardErrorMessage(null);
    }, 2500);

    return () => {
      window.clearTimeout(timerId);
    };
  }, [boardErrorMessage]);

  const handleOpenCreateCard = useCallback((columnId: number) => {
    setCreateCardColumnId(columnId);
  }, []);

  const handleOpenEditColumn = useCallback((column: ColumnType) => {
    setEditColumnModal({
      column,
      title: column.title,
      error: '',
    });
  }, []);

  const handleCardClick = useCallback(
    (card: Card) => {
      flushSync(() => {
        setSelectedCardId(card.id);
      });
      window.requestAnimationFrame(() => {
        updateCardQueryParam(card.id);
      });
    },
    [updateCardQueryParam],
  );

  const handleOpenAddColumnModal = useCallback(() => {
    setAddColumnModal({ isOpen: true, title: '', error: '' });
  }, []);

  const handleCloseCardModal = useCallback(() => {
    flushSync(() => {
      setSelectedCardId(null);
    });
    window.requestAnimationFrame(() => {
      updateCardQueryParam(null);
    });
  }, [updateCardQueryParam]);

  const handleEditColumnConfirm = async () => {
    const { column, title } = editColumnModal;
    if (!column) return;
    const trimmed = title.trim();
    if (!trimmed) {
      setEditColumnModal((prev) => ({
        ...prev,
        error: '컬럼 이름을 입력해주세요.',
      }));
      return;
    }
    try {
      await updateColumn({ columnId: column.id, title: trimmed });
      setEditColumnModal({ column: null, title: '', error: '' });
    } catch {
      setEditColumnModal((prev) => ({
        ...prev,
        error: '컬럼 수정에 실패했습니다.',
      }));
    }
  };

  const handleDeleteColumnConfirm = async () => {
    if (!deleteColumnId) return;
    try {
      await deleteColumn(deleteColumnId);
    } catch {
      // 에러 토스트는 useDashboardColumnMutations의 onDeleteError에서 처리한다.
    } finally {
      setDeleteColumnId(null);
    }
  };

  const handleAddColumnConfirm = async () => {
    const trimmed = addColumnModal.title.trim();
    if (!trimmed) {
      setAddColumnModal((prev) => ({
        ...prev,
        error: '컬럼 이름을 입력해주세요.',
      }));
      return;
    }
    try {
      await createColumn(trimmed);
      setAddColumnModal({ isOpen: false, title: '', error: '' });
    } catch {
      setAddColumnModal((prev) => ({
        ...prev,
        error: '컬럼 생성에 실패했습니다.',
      }));
    }
  };

  const boardContent = useMemo(
    () => (
      <div className="flex-1 overflow-hidden bg-gray-100">
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragStart={handleDragStart}
          onDragOver={handleDragOver}
          onDragEnd={handleDragEnd}
        >
          <div className="flex flex-col lg:flex-row h-full overflow-y-auto lg:overflow-y-hidden lg:overflow-x-auto">
            {isColumnsLoading
              ? Array.from({ length: 3 }).map((_, index) => (
                  <div
                    key={`column-skeleton-${index}`}
                    className="w-full lg:w-dashboard-column shrink-0 border-b lg:border-b-0 lg:border-r border-gray-200 px-4 md:px-5 py-4"
                  >
                    <div className="h-6 w-36 rounded bg-gray-200 animate-pulse mb-4" />
                    <div className="h-10 w-full rounded-md bg-gray-200 animate-pulse mb-4" />
                    <div className="h-32 w-full rounded-card-sm bg-gray-200 animate-pulse" />
                  </div>
                ))
              : columns.map((column, index) => (
                  <Column
                    key={column.id}
                    column={column}
                    cards={columnCards[column.id]?.cards ?? EMPTY_CARDS}
                    totalCount={columnCards[column.id]?.totalCount ?? 0}
                    cursorId={columnCards[column.id]?.cursorId}
                    colorIndex={index}
                    isFirstColumn={index === 0}
                    onAddCard={handleOpenCreateCard}
                    onEditColumn={handleOpenEditColumn}
                    onCardClick={handleCardClick}
                    onLoadMore={loadMoreCards}
                    isLoadingMore={loadingColumnIds.has(column.id)}
                  />
                ))}

            <div className="flex items-start pt-4 lg:pt-space-26 px-4 md:px-5 pb-8 lg:pb-0 shrink-0">
              <Button
                variant="secondary"
                size="lg"
                onClick={handleOpenAddColumnModal}
                className="h-dashboard-add-mobile w-full typo-lg-bold md:h-dashboard-add-desktop md:w-full md:typo-2lg-bold lg:w-dashboard-column"
              >
                새로운 컬럼 추가하기
                <span className="w-5 h-5 flex items-center justify-center rounded bg-brand-violet-light text-brand-violet typo-lg-bold leading-none">
                  +
                </span>
              </Button>
            </div>
          </div>

          <DragOverlay>
            {activeCard && (
              <div className="rotate-2 shadow-xl opacity-95">
                <TaskCard
                  card={activeCard.card}
                  columnId={activeCard.columnId}
                  onClick={() => {}}
                  isDragOverlay
                />
              </div>
            )}
          </DragOverlay>
        </DndContext>
      </div>
    ),
    [
      sensors,
      handleDragStart,
      handleDragOver,
      handleDragEnd,
      isColumnsLoading,
      columns,
      columnCards,
      handleOpenCreateCard,
      handleOpenEditColumn,
      handleCardClick,
      loadMoreCards,
      loadingColumnIds,
      handleOpenAddColumnModal,
      activeCard,
    ],
  );

  if (isDashboardLoading) return <DashboardBoardSkeleton />;

  if (!dashboard) {
    return (
      <div className="flex items-center justify-center flex-1 h-full min-h-screen-without-header">
        <p className="text-gray-400 typo-lg-regular">
          대시보드를 찾을 수 없습니다.
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      <div className="lg:hidden border-b border-gray-200 bg-white px-4 py-3 md:px-5">
        <h1 className="truncate typo-2lg-bold text-gray-700">
          {dashboard.title}
        </h1>
      </div>
      {boardContent}

      {selectedCardId !== null && (
        <Cards
          onModalClose={handleCloseCardModal}
          cardId={selectedCardId!}
          dashboardId={dashboardId}
        />
      )}

      {createCardColumnId !== null && (
        <CreateCard
          onModalClose={() => setCreateCardColumnId(null)}
          dashboardId={dashboardId}
          columnId={createCardColumnId}
        />
      )}

      {addColumnModal.isOpen && (
        <div
          className="fixed inset-0 z-50 overflow-y-auto bg-black/40"
          onClick={() =>
            setAddColumnModal({ isOpen: false, title: '', error: '' })
          }
        >
          <div className="flex min-h-full items-center justify-center px-4 py-8">
            <div onClick={(e) => e.stopPropagation()}>
              <FormModal
                title="새 컬럼 생성"
                label="이름"
                value={addColumnModal.title}
                placeholder="새로운 프로젝트"
                confirmText="생성"
                errorText={addColumnModal.error}
                showCloseButton
                onChange={(v) =>
                  setAddColumnModal((prev) => ({
                    ...prev,
                    title: v,
                    error: '',
                  }))
                }
                onCancel={() =>
                  setAddColumnModal({ isOpen: false, title: '', error: '' })
                }
                onConfirm={handleAddColumnConfirm}
                onClose={() =>
                  setAddColumnModal({ isOpen: false, title: '', error: '' })
                }
              />
            </div>
          </div>
        </div>
      )}

      {editColumnModal.column && (
        <div
          className="fixed inset-0 z-50 overflow-y-auto bg-black/40"
          onClick={() =>
            setEditColumnModal({ column: null, title: '', error: '' })
          }
        >
          <div className="flex min-h-full items-center justify-center px-4 py-8">
            <div onClick={(e) => e.stopPropagation()}>
              <FormModal
                title="컬럼 수정"
                label="이름"
                value={editColumnModal.title}
                confirmText="변경"
                cancelText="삭제하기"
                errorText={editColumnModal.error}
                showCloseButton
                onChange={(v) =>
                  setEditColumnModal((prev) => ({
                    ...prev,
                    title: v,
                    error: '',
                  }))
                }
                onCancel={() => {
                  if (!editColumnModal.column) return;
                  setDeleteColumnId(editColumnModal.column.id);
                  setEditColumnModal({ column: null, title: '', error: '' });
                }}
                onConfirm={handleEditColumnConfirm}
                onClose={() =>
                  setEditColumnModal({ column: null, title: '', error: '' })
                }
              />
            </div>
          </div>
        </div>
      )}

      {deleteColumnId !== null && (
        <div
          className="fixed inset-0 z-50 overflow-y-auto bg-black/40"
          onClick={() => setDeleteColumnId(null)}
        >
          <div className="flex min-h-full items-center justify-center px-4 py-8">
            <div onClick={(e) => e.stopPropagation()}>
              <ConfirmModal
                message="칼럼의 모든 카드가 삭제됩니다. 정말 삭제하시겠습니까?"
                confirmText="삭제"
                onCancel={() => setDeleteColumnId(null)}
                onConfirm={handleDeleteColumnConfirm}
              />
            </div>
          </div>
        </div>
      )}

      {boardErrorMessage && (
        <div
          role="alert"
          aria-live="assertive"
          className="fixed bottom-6 left-1/2 z-50 -translate-x-1/2 rounded-lg bg-gray-700 px-4 py-3 typo-sm-medium text-white shadow-lg md:bottom-auto md:top-6"
        >
          {boardErrorMessage}
        </div>
      )}
    </div>
  );
}
