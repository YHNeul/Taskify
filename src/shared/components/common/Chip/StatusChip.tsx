/**
 * @file StatusChip.tsx
 * @description 작업의 진행 상태(todo, in-progress, done)를 시각적으로 표시하는 태그 컴포넌트입니다.
 * 할 일 카드 및 대시보드 UI에서 사용됩니다.
 *
 * @author 수경
 */

interface StatusTagProps {
  status: string;
}

export default function StatusChip({ status }: StatusTagProps) {
  const label = status;

  return (
    <div className="max-w-36 w-max mobile:min-w-16 mobile:min-h-7 inline-flex items-center gap-2 bg-brand-violet-light px-3 py-1 rounded-2xl">
      <span className="w-2 h-2 rounded-full bg-brand-violet shrink-0"></span>
      <p className="text-brand-violet typo-md-regular truncate">
        {status ? label : '-'}
      </p>
    </div>
  );
}
