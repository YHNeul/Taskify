import { Invitation } from '@/shared/types/dashboard';
import ConfirmButton from '@/shared/components/common/ConfirmButton';
import SearchIcon from '@/shared/components/common/Icon/SearchIcon';
import { Input } from '@/shared/components/common/Input';
import { RefObject, useMemo, useRef } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { respondToInvitation } from '@/shared/apis/dashboard';
import { useQueryParamState } from '@/shared/hooks/useQueryParamState';

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
  const [titleSearch, setTitleSearch] = useQueryParamState<string>({
    key: 'inviteSearch',
    defaultValue: '',
    parse: (rawValue) => rawValue ?? '',
    serialize: (value) => {
      const trimmed = value.trim();
      return trimmed ? trimmed : null;
    },
  });
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
    <div className="py-6 bg-white md:py-4.5 lg:py-8">
      <div>
        <h2 className="px-5 text-gray-700 text-lg-bold md:px-10 md:text-2xl-bold">
          초대받은 대시보드
        </h2>
      </div>

      <div className="mt-4 px-4 md:mt-17 md:px-7 lg:px-10 lg:mt-8">
        <div className="relative w-full">
          <div className="absolute inset-y-0 left-3 flex items-center z-10">
            <SearchIcon className="w-5.5 md:w-6" />
          </div>
          <Input
            type="search"
            placeholder="검색"
            value={titleSearch}
            aria-label="대시보드 이름으로 검색"
            onChange={(e) => setTitleSearch(e.target.value)}
            className="w-full px-11 border border-gray-300 rounded-md"
          />
        </div>
      </div>

      <div className="flex-1 max-h-screen overflow-y-auto custom-scrollbar mt-3 md:mt-6">
        {/** --- 1. 모바일 카드 레이아웃 (768px 미만) --- */}
        <div className="md:hidden px-4 flex flex-col">
          {filteredData.map((item) => (
            <div key={item.id} className="py-3.5 border-b border-gray-200">
              <div className="flex flex-col gap-1 mb-3.5">
                <div className="flex items-center">
                  <span className="w-15 shrink-0 text-md-regular text-gray-400">
                    이름
                  </span>
                  <span className="text-md-regular text-gray-700 truncate">
                    {item.dashboard.title}
                  </span>
                </div>
                <div className="flex items-center">
                  <span className="w-15 shrink-0 text-md-regular text-gray-400">
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
                <th className="pl-7 font-normal text-left lg:pl-20 w-2/5">
                  이름
                </th>
                <th className="font-normal text-left w-1/5">초대자</th>
                <th className="px-7 font-normal text-center">수락 여부</th>
              </tr>
            </thead>

            <tbody>
              {filteredData.map((item) => (
                <tr key={item.id} className="border-gray-200 border-b">
                  <td className="pl-7 pr-2.5 py-5 font-normal text-left lg:pl-20 lg:pr-5 text-gray-700">
                    <div className="truncate max-w-60 lg:max-w-sm">
                      {item.dashboard.title}
                    </div>
                  </td>
                  <td className="py-5 font-normal text-left">
                    <div className="truncate md:max-w-48">
                      {item.inviter.nickname}
                    </div>
                  </td>
                  <td className="px-7 text-center">
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
