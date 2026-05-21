import { Invitation } from '@/types/dashboard';
import ConfirmButton from '../common/ConfirmButton';
import SearchIcon from '../common/Icon/SearchIcon';
import { Input } from '../common/Input';
import { RefObject, useMemo, useRef, useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { respondToInvitation } from '@/api/dashboard';

interface InvitationTableProps {
  data: Invitation[];
  observerRef: RefObject<HTMLDivElement | null>;
}

function filterInvitationsByTitle(
  items: Invitation[],
  keyword: string,
): Invitation[] {
  const q = keyword.trim().toLowerCase();
  if (!q) return items;
  return items.filter((item) => item.dashboard.title.toLowerCase().includes(q));
}

/** 중복 제거 로직 */
function getUniqueInvitations(invitations: Invitation[]) {
  const usedDashboardIds = new Set();

  return invitations.filter((item) => {
    const dashboardId = item.dashboard.id;
    if (usedDashboardIds.has(dashboardId)) return false;
    usedDashboardIds.add(dashboardId);
    return true;
  });
}

export default function InvitationTable({
  data,
  observerRef,
}: InvitationTableProps) {
  const queryClient = useQueryClient();
  const mutationInFlightRef = useRef(false);
  const [titleSearch, setTitleSearch] = useState('');
  const uniqueData = useMemo(() => getUniqueInvitations(data), [data]);

  const filteredData = useMemo(
    () => filterInvitationsByTitle(uniqueData, titleSearch),
    [uniqueData, titleSearch],
  );

  const { mutate } = useMutation({
    mutationFn: ({ id, accepted }: { id: number; accepted: boolean }) =>
      respondToInvitation(id, accepted),

    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['myInvitations'] });
      queryClient.invalidateQueries({ queryKey: ['dashboards'] });
    },
  });

  const handleInvitation = (params: { id: number; accepted: boolean }) => {
    if (mutationInFlightRef.current) return;
    mutationInFlightRef.current = true;
    mutate(params, {
      onSettled: () => {
        mutationInFlightRef.current = false;
      },
    });
  };

  return (
    <div className="py-[24px] bg-white md:py-[18px] lg:py-[32px]">
      <div>
        <h2 className="px-[20px] text-gray-700 text-lg-bold md:px-[40px] md:text-2xl-bold">
          초대받은 대시보드
        </h2>
      </div>

      <div className="mt-[16px] px-[16px] md:mt-[17px] md:px-[28px] lg:px-[40px] lg:mt-[32px]">
        <div className="relative w-full">
          <div className="absolute inset-y-0 left-[12px] flex items-center z-10">
            <SearchIcon className="w-[22px] md:w-[24px]" />
          </div>
          <Input
            type="search"
            placeholder="검색"
            value={titleSearch}
            aria-label="대시보드 이름으로 검색"
            onChange={(e) => setTitleSearch(e.target.value)}
            className="w-full px-[44px] border border-gray-300 rounded-[6px]"
          />
        </div>
      </div>

      <div className="flex-1 max-h-[625px] overflow-y-auto custom-scrollbar mt-[13px] md:mt-[24px]">
        {/** --- 1. 모바일 카드 레이아웃 (768px 미만) --- */}
        <div className="md:hidden px-[16px] flex flex-col">
          {filteredData.map((item) => (
            <div key={item.id} className="py-[14px] border-b border-gray-200">
              <div className="flex flex-col gap-[3px] mb-[14px]">
                <div className="flex items-center">
                  <span className="w-[60px] shrink-0 text-md-regular text-gray-400">
                    이름
                  </span>
                  <span className="text-md-regular text-gray-700 truncate">
                    {item.dashboard.title}
                  </span>
                </div>
                <div className="flex items-center">
                  <span className="w-[60px] shrink-0 text-md-regular text-gray-400">
                    초대자
                  </span>
                  <span className="text-md-regular text-gray-700 truncate">
                    {item.inviter.nickname}
                  </span>
                </div>
              </div>
              <ConfirmButton
                onAccept={() =>
                  handleInvitation({ id: item.id, accepted: true })
                }
                onReject={() =>
                  handleInvitation({ id: item.id, accepted: false })
                }
              />
            </div>
          ))}
        </div>
        {/** --- 2. pc 테이블 레이아웃 (768px 이상) --- */}
        <div className="hidden md:block">
          <table className="w-full table-fixed text-lg-regular text-gray-500">
            <thead className="sticky top-0 bg-white z-10 text-lg-regular text-gray-400">
              <tr>
                <th className="pl-[28px] font-normal text-left lg:pl-[76px] w-[40%]">
                  이름
                </th>
                <th className="font-normal text-left w-[20%]">초대자</th>
                <th className="px-[28px] font-normal text-center">수락 여부</th>
              </tr>
            </thead>

            <tbody>
              {filteredData.map((item) => (
                <tr key={item.id} className="border-gray-200 border-b">
                  <td className="pl-[28px] pr-[10px] py-[20px] font-normal text-left lg:pl-[76px] lg:pr-[20px] text-gray-700">
                    <div className="truncate max-w-[250px] lg:max-w-[400px]">
                      {item.dashboard.title}
                    </div>
                  </td>
                  <td className="py-[20px] font-normal text-left">
                    <div className="truncate md:max-w-[200px]">
                      {item.inviter.nickname}
                    </div>
                  </td>
                  <td className="px-[28px] text-center">
                    <ConfirmButton
                      onAccept={() =>
                        handleInvitation({ id: item.id, accepted: true })
                      }
                      onReject={() =>
                        handleInvitation({ id: item.id, accepted: false })
                      }
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div ref={observerRef} className="h-1 w-full" />
      </div>
    </div>
  );
}
