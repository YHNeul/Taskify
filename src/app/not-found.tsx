import Link from 'next/link';
import ErrorPageView from '@/shared/components/common/error-page/ErrorPageView';

export default function NotFound() {
  return (
    <ErrorPageView
      statusCode="404"
      title="페이지를 찾을 수 없어요"
      description="요청하신 페이지가 존재하지 않거나 이동 또는 삭제되었을 수 있습니다."
      actions={
        <Link
          href="/"
          className="inline-flex h-12 min-w-40 items-center justify-center rounded-full bg-brand-violet px-6 typo-lg-medium text-white! transition-opacity hover:opacity-90"
        >
          홈으로 이동
        </Link>
      }
    />
  );
}
