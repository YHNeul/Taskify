/**
 * @file AssigneeItem.tsx
 * @description 
 * ### 반응형 브레이트포인트
 * | breakpoint | 기기        |
| ---------- | -------------- |
| sm (640)   | 큰 모바일 / 작은 태블릿 |
| md (768)   | 태블릿            |
| lg (1024)  | 작은 노트북         |
| xl (1280)  | 데스크탑           |
| 2xl (1536) | 큰 모니터          |

 *
 * @author 수경
 *
 */
import UserName from '@/components/common/User/UserName';
import type { Assignee } from '@/types/dashboard';

interface Props {
  assignee?: Assignee | null;
  dueDate?: string | null;
}

export default function AssigneeItem({ assignee, dueDate }: Props) {
  const sectionClass = 'flex flex-col gap-[6px] w-full';
  const titleClass = 'text-xs-semibold';

  return (
    <div className="flex md:flex-col flex-row flex-wrap mobile:flex-nowrap items-center md:gap-4 gap-1 md:w-[200px] px-4 py-[14px] border border-gray-300 rounded-lg">
      <div className={sectionClass}>
        <p className={titleClass}>담당자</p>
        <div>
          {assignee ? (
            <UserName
              profile={assignee}
              fontSize={'text-md-regular md:text-lg-regular'}
            />
          ) : (
            <span className="md:h-5 h-4">-</span>
          )}
        </div>
      </div>
      <div className={sectionClass}>
        <p className={titleClass}>마감일</p>
        <div>
          <p className="text-gray-700 text-md-regular">
            {dueDate ? dueDate : <span className="md:h-5 h-4">-</span>}
          </p>
        </div>
      </div>
    </div>
  );
}
