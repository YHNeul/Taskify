/**
 * @file CountCardChip.tsx
 * @description 할 일 카드의 개수를 보여주는 컴포넌트입니다.
 * 대시보드 내 진행 상태에 따라 할 일 카드의 개수를 보여줍니다.
 *
 * @author 수경
 */

interface Props {
  /**
   * @default 0
   */
  count?: number;
}

export default function CountCardChip({ count = 0 }: Props) {
  return (
    <>
      <div className="w-fit min-h-5 rounded bg-gray-200 px-1 py-1">
        <p className="text-gray-500 text-xs-medium leading-3 px-[2px]">
          {count}
        </p>
      </div>
    </>
  );
}
