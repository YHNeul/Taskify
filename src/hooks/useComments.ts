/**
 * @file 댓글 목록 조회 및 무한 스크롤 커스텀 훅
 */

import { deleteComments, getComments } from '@/api/dashboard';
import { Comments } from '@/types/dashboard';
import { useCallback, useEffect, useRef, useState } from 'react';

/** 한 번에 불러올 댓글 수 */
const COMMENTS_SIZE = 10;

export default function useComments(cardId: number) {
  const [errorMessage, setErrorMessage] = useState<string | null>(null); // API 호출 에러 처리
  const [deletingCommentId, setDeletingCommentId] = useState<number | null>(
    null,
  );

  const [commentsList, setCommentsList] = useState<Comments[]>([]); // 누적된 댓글 배열
  const [cursorId, setCursorId] = useState<number | null>(null); // 다음 페이지 요청에 사용할 커서 ID
  const [hasMore, setHasMore] = useState(true); // 다음 페이지 존재 여부
  const [isFetchingMore, setIsFetchingMore] = useState(false); // 추가 로딩 중 여부 (중복 요청 방지용 guard)

  /** IntersectionObserver가 감시할 댓글 맨 마지막 div */
  const sentinelRef = useRef<HTMLDivElement>(null);

  /**
   * 댓글 스크롤 컨테이너 ref
   * IntersectionObserver의 root로 지정해 뷰포트 대신 이 컨테이너 기준으로 교차를 감지
   */
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  const fetchComments = useCallback(
    async (cursor: number | null = null, reset = false) => {
      // reset이 아닌 일반 추가 로딩 중에는 중복 요청 방지
      if (!reset && isFetchingMore) return;

      setIsFetchingMore(true);
      try {
        const res = await getComments(
          cardId,
          COMMENTS_SIZE,
          cursor ?? undefined,
        );

        // reset: 새 배열로 교체 / 일반: 기존 배열에 누적
        setCommentsList((prev) =>
          reset ? res.comments : [...prev, ...res.comments],
        );

        const nextCursor = res.cursorId;
        setCursorId(nextCursor);

        // 더 이상 없으면 false
        setHasMore(
          res.comments.length === COMMENTS_SIZE && nextCursor !== null,
        );

        // 받아온 개수 < COMMENTS_SIZE → 마지막 페이지
        setHasMore(
          res.comments.length === COMMENTS_SIZE && res.cursorId !== null,
        );
      } catch (error) {
        console.error('댓글 조회 실패', error);
        setErrorMessage('댓글 목록 조회에 문제가 발생했습니다.');
      } finally {
        setIsFetchingMore(false);
      }
    },
    // isFetchingMore를 deps에 넣으면 무한 루프 발생 → 의도적으로 제외
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [cardId],
  );

  /** 최초 댓글 로드 */
  useEffect(() => {
    fetchComments(null, true);
  }, [fetchComments]);

  /** IntersectionObserver — sentinel 감지 → 다음 페이지 로드 */
  useEffect(() => {
    const sentinel = sentinelRef.current;
    const container = scrollContainerRef.current;
    if (!sentinel || !container) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        // sentinel이 컨테이너 안에 보이고 + 추가 데이터 있고 + 로딩 중 아닐 때만 fetch
        if (entry.isIntersecting && hasMore && !isFetchingMore) {
          fetchComments(cursorId);
        }
      },
      {
        root: container, // 뷰포트 대신 댓글 스크롤 컨테이너를 기준으로 교차 감지
        threshold: 0.1,
      },
    );

    observer.observe(sentinel);
    return () => observer.disconnect();
  }, [hasMore, isFetchingMore, cursorId, fetchComments]);

  const resetAndFetch = () => {
    setCursorId(null);
    setHasMore(true);
    fetchComments(null, true);
  };

  /** 댓글 삭제 API 호출 핸들러 */
  const handleDeleteCommentConfirm = async () => {
    if (!deletingCommentId) return;
    try {
      await deleteComments(deletingCommentId);
      resetAndFetch();

      await fetchComments(null, true);
    } catch {
      setErrorMessage('댓글 삭제에 문제가 발생했습니다.');
    } finally {
      setDeletingCommentId(null);
    }
  };

  return {
    commentsList,
    hasMore,
    isFetchingMore,
    errorMessage,
    setErrorMessage,
    deletingCommentId,
    setDeletingCommentId,
    sentinelRef,
    scrollContainerRef,
    resetAndFetch,
    handleDeleteCommentConfirm,
    COMMENTS_SIZE,
  };
}
