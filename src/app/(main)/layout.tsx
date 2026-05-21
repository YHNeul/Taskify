/**
 * @file layout.tsx
 * @description 대시보드(Main) 라우트 그룹의 공통 레이아웃 컴포넌트입니다.
 * 좌측 고정 사이드메뉴(SideMenu)와 상단 헤더(Header)를 포함하며, 우측 하단 영역에 자식 페이지를 렌더링합니다.
 *
 * @author 하늘,승미
 */

// import Header from '@/components/layout/Header';
import SideMenu from '@/components/layout/SideMenu';
import Header from '@/components/layout/Header';

export default function MainLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    // h-screen + overflow-hidden으로 전체 높이를 뷰포트에 고정해야 자식의 h-full이 작동함
    <div className="flex h-screen overflow-hidden">
      <SideMenu />

      <div className="flex flex-col flex-1 min-w-0">
        <Header />

        {/* NOTE: 헤더는 각 페이지 컴포넌트 내부에서 구현합니다. (담당자: 승미님) */}

        {/* min-h-0이 없으면 flex 자식이 부모를 넘쳐서 스크롤이 깨짐 */}
        <main className="flex-1 min-h-0 overflow-y-auto bg-gray-100">
          {children}
        </main>
      </div>
    </div>
  );
}
