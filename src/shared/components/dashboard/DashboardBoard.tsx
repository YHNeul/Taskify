'use client';

import { useState, useEffect, useCallback } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { DndContext, DragOverlay, closestCenter } from '@dnd-kit/core';
import { useDashboardStore } from '@/shared/store/useDashboardStore';
import type { Column as ColumnType, Card } from '@/shared/types/dashboard';
import {
  getCards,
  createColumn,
  updateColumn,
  deleteColumn,
} from '@/shared/apis/dashboard';
import Column from '@/shared/components/dashboard/Column';
import TaskCard from '@/shared/components/dashboard/TaskCard';
import Button from '@/shared/components/common/Button';
import { QUERY_KEYS } from '@/shared/constants/queryKeys';
import Cards from '@/shared/components/modal/Cards/Cards';
import CreateCard from '@/shared/components/modal/Cards/CreateCard';
import FormModal from '@/shared/components/modal/FormModal';
import ConfirmModal from '@/shared/components/modal/ConfirmModal';
import DashboardBoardSkeleton from '@/shared/components/dashboard/BoardSkeleton';
import { useBoardDnd, type ColumnCardState } from '@/shared/hooks/useBoardDnd';
import { applySavedOrder } from '@/shared/utils/cardOrder';
import { useDashboardQuery } from '@/shared/hooks/useDashboardQuery';
import { useDashboardColumnsQuery } from '@/shared/hooks/useDashboardColumnsQuery';
import { useDashboardColumnCardsQuery } from '@/shared/hooks/useDashboardColumnCardsQuery';
import { useQueryParamState } from '@/shared/hooks/useQueryParamState';

interface DashboardBoardProps {
  dashboardId: number;
}

export default function DashboardBoard({ dashboardId }: DashboardBoardProps) {
  const [columnCards, setColumnCards] = useState<
    Record<number, ColumnCardState>
  >({});
  const [loadingColumnIds, setLoadingColumnIds] = useState<Set<number>>(
    new Set(),
  );

  const [selectedCardId, setSelectedCardId] = useQueryParamState<number | null>(
    {
      key: 'cardId',
      defaultValue: null,
      parse: (rawValue) => {
        if (!rawValue) return null;
        const parsed = Number(rawValue);
        return Number.isFinite(parsed) && parsed > 0
          ? Math.floor(parsed)
          : null;
      },
      serialize: (value) => (value ? String(value) : null),
    },
  );
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

  const queryClient = useQueryClient();
  const setActiveDashboardId = useDashboardStore((s) => s.setActiveDashboardId);

  useEffect(() => {
    setActiveDashboardId(dashboardId);
  }, [dashboardId, setActiveDashboardId]);

  const { data: dashboard, isLoading: isDashboardLoading } =
    useDashboardQuery(dashboardId);

  const { data: columnsData, isLoading: isColumnsLoading } =
    useDashboardColumnsQuery(dashboardId);

  const columns = columnsData?.data ?? [];
  const { data: columnCardsData } = useDashboardColumnCardsQuery({
    dashboardId,
    columns,
    size: 10,
  });

  useEffect(() => {
    if (!columnCardsData) return;
    const ordered: Record<number, ColumnCardState> = {};
    for (const [colId, state] of Object.entries(columnCardsData)) {
      const id = Number(colId);
      ordered[id] = { ...state, cards: applySavedOrder(id, state.cards) };
    }
    setColumnCards(ordered);
  }, [columnCardsData]);

  const {
    sensors,
    activeCard,
    handleDragStart,
    handleDragOver,
    handleDragEnd,
  } = useBoardDnd({ columnCards, setColumnCards });

  const handleLoadMore = useCallback(
    async (columnId: number, cursorId: number) => {
      setLoadingColumnIds((prev) => new Set(prev).add(columnId));
      try {
        const result = await getCards(columnId, 10, cursorId);
        setColumnCards((prev) => ({
          ...prev,
          [columnId]: {
            cards: [...(prev[columnId]?.cards ?? []), ...result.cards],
            totalCount: result.totalCount,
            cursorId: result.cursorId,
          },
        }));
      } finally {
        setLoadingColumnIds((prev) => {
          const next = new Set(prev);
          next.delete(columnId);
          return next;
        });
      }
    },
    [],
  );

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
      await updateColumn(column.id, trimmed);
      queryClient.invalidateQueries({
        queryKey: QUERY_KEYS.columns(dashboardId),
      });
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
      queryClient.invalidateQueries({
        queryKey: QUERY_KEYS.columns(dashboardId),
      });
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
      await createColumn(trimmed, dashboardId);
      queryClient.invalidateQueries({
        queryKey: QUERY_KEYS.columns(dashboardId),
      });
      setAddColumnModal({ isOpen: false, title: '', error: '' });
    } catch {
      setAddColumnModal((prev) => ({
        ...prev,
        error: '컬럼 생성에 실패했습니다.',
      }));
    }
  };

  if (isDashboardLoading || isColumnsLoading) return <DashboardBoardSkeleton />;

  if (!dashboard) {
    return (
      <div className="flex items-center justify-center flex-1 h-full min-h-[calc(100vh-64px)]">
        <p className="text-gray-400 text-lg-regular">
          대시보드를 찾을 수 없습니다.
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      <div className="flex-1 overflow-hidden bg-gray-100">
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragStart={handleDragStart}
          onDragOver={handleDragOver}
          onDragEnd={handleDragEnd}
        >
          <div className="flex flex-col lg:flex-row h-full overflow-y-auto lg:overflow-y-hidden lg:overflow-x-auto">
            {columns.map((column, index) => (
              <Column
                key={column.id}
                column={column}
                cards={columnCards[column.id]?.cards ?? []}
                totalCount={columnCards[column.id]?.totalCount ?? 0}
                cursorId={columnCards[column.id]?.cursorId}
                colorIndex={index}
                isFirstColumn={index === 0}
                onAddCard={(columnId) => setCreateCardColumnId(columnId)}
                onEditColumn={(col) =>
                  setEditColumnModal({
                    column: col,
                    title: col.title,
                    error: '',
                  })
                }
                onCardClick={(card: Card) => {
                  setSelectedCardId(card.id);
                }}
                onLoadMore={handleLoadMore}
                isLoadingMore={loadingColumnIds.has(column.id)}
              />
            ))}

            <div className="flex items-start pt-4 lg:pt-[64px] px-4 md:px-5 pb-8 lg:pb-0 shrink-0">
              <Button
                variant="secondary"
                size="lg"
                onClick={() =>
                  setAddColumnModal({ isOpen: true, title: '', error: '' })
                }
                className="h-[66px] w-full text-lg-bold md:h-[70px] md:w-full md:text-2lg-bold lg:w-[354px]"
              >
                새로운 컬럼 추가하기
                <span className="w-5 h-5 flex items-center justify-center rounded bg-brand-violet-light text-brand-violet text-lg-bold leading-none">
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

      {selectedCardId !== null && (
        <Cards
          onModalClose={() => {
            setSelectedCardId(null);
          }}
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
                  setAddColumnModal((prev) => ({ ...prev, title: v, error: '' }))
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
                  setEditColumnModal((prev) => ({ ...prev, title: v, error: '' }))
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
    </div>
  );
}
