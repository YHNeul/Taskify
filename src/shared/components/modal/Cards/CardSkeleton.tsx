/**
 * @file 카드 모달 스켈레톤 컴포넌트
 */

import ModalBase from '@/shared/components/common/ModalBase';
import ModalOverlay from '@/shared/components/common/ModalBase/ModalOverlay';
import Skeleton from '@/shared/components/common/Skeleton/Skeleton';

export default function CardSkeleton({
  onModalClose,
}: {
  onModalClose: () => void;
}) {
  return (
    <ModalOverlay onClose={onModalClose}>
      <ModalBase className="relative w-full md:w-fit md:min-w-card-detail-content max-h-screen-minus-110 overflow-y-auto flex flex-col md:flex-row gap-4 md:gap-0 text-gray-700 rounded-card-sm px-4 mobile:px-8 py-6 mx-6 md:m-0">
        {/* 우측 영역 */}
        <aside className="order-1 md:order-2 flex flex-col items-start gap-6 min-w-50 w-full md:w-52 md:pl-4 md:border-l md:border-gray-200 animate-pulse">
          {/* 메뉴, 닫기 버튼 */}
          <div className="self-end flex gap-1 md:gap-3">
            <Skeleton className="w-7 h-7 rounded" />
            <Skeleton className="w-7 h-7 rounded" />
          </div>

          {/* 담당자/마감일 */}
          <div className="hidden md:flex flex-col gap-4 w-full">
            <div className="pb-4 border-b border-gray-200">
              <Skeleton className="h-4 w-14 rounded mb-2" />
              <div className="flex items-center gap-2">
                <Skeleton className="w-7 h-7 rounded-full shrink-0" />
                <Skeleton className="h-4 w-20 rounded" />
              </div>
            </div>
            <div>
              <Skeleton className="h-4 w-12 rounded mb-2" />
              <Skeleton className="h-4 w-28 rounded" />
            </div>
          </div>
        </aside>

        {/* 좌측 영역 */}
        <div className="order-2 md:order-1 flex flex-col md:w-content-450 md:shrink-0 md:pr-4 animate-pulse">
          {/* 제목 */}
          <div className="mb-2 md:mb-6">
            <Skeleton className="h-8 w-3/4 rounded-md" />
          </div>

          {/* 모바일 담당자/마감일 */}
          <div className="md:hidden mb-4">
            <Skeleton className="h-16 w-full rounded-xl" />
          </div>

          {/* 진행 상태 및 태그 */}
          <div className="flex items-center gap-5 mb-4 md:mb-17">
            <Skeleton className="h-6 w-20 rounded-full" />
            <div className="w-px h-5 bg-gray-300" />
            <div className="flex gap-1.5">
              <Skeleton className="h-6 w-14 rounded-full" />
              <Skeleton className="h-6 w-14 rounded-full" />
            </div>
          </div>

          {/* 설명 */}
          <div className="flex flex-col gap-2 min-h-24 p-2.5 mb-8 md:mb-2">
            <Skeleton className="h-4 w-full rounded" />
            <Skeleton className="h-4 w-5/6 rounded" />
            <Skeleton className="h-4 w-4/6 rounded" />
          </div>

          {/* 이미지 */}
          <Skeleton className="w-full h-40 md:h-64 rounded-md mb-6 md:mb-4" />

          {/* 댓글 */}
          <div className="flex flex-col gap-3">
            <Skeleton className="h-24 w-full rounded-md" />
            <div className="flex flex-col gap-4 mt-4">
              <div className="flex gap-2.5">
                <Skeleton className="w-8 h-8 rounded-full shrink-0" />
                <div className="flex flex-col gap-2 flex-1">
                  <Skeleton className="h-4 w-24 rounded" />
                  <Skeleton className="h-4 w-full rounded" />
                </div>
              </div>
              <div className="flex gap-2.5">
                <Skeleton className="w-8 h-8 rounded-full shrink-0" />
                <div className="flex flex-col gap-2 flex-1">
                  <Skeleton className="h-4 w-24 rounded" />
                  <Skeleton className="h-4 w-full rounded" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </ModalBase>
    </ModalOverlay>
  );
}
