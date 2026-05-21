/**
 * @file 대시보드 관련 API 함수 모음
 * @description 대시보드, 칼럼, 할 일 카드, 멤버 CRUD API를 모아둔 파일입니다.
 * @author 하늘
 */

import api from './axios';
import type {
  Dashboard,
  DashboardsResponse,
  ColumnsResponse,
  CardsResponse,
  MembersResponse,
  Comments,
  CommentsResponse,
  GetInvitationsResponse,
  Invitation,
  DashboardInvitationsResponse,
} from '@/types/dashboard';

/** 대시보드 목록 조회 (사이드 네비게이션용, 페이지 기반) */
export async function getDashboards(
  page = 1,
  size = 15,
): Promise<DashboardsResponse> {
  const { data } = await api.get<DashboardsResponse>('/dashboards', {
    params: { navigationMethod: 'pagination', page, size },
  });
  return data;
}

/** 대시보드 단건 조회 */
export async function getDashboard(dashboardId: number): Promise<Dashboard> {
  const { data } = await api.get<Dashboard>(`/dashboards/${dashboardId}`);
  return data;
}

/** 대시보드 정보 수정 */
export async function updateDashboard(
  dashboardId: number,
  body: Pick<Dashboard, 'title' | 'color'>,
): Promise<Dashboard> {
  const { data } = await api.put<Dashboard>(`/dashboards/${dashboardId}`, body);
  return data;
}

/** 칼럼 목록 조회 */
export async function getColumns(
  dashboardId: number,
): Promise<ColumnsResponse> {
  const { data } = await api.get<ColumnsResponse>('/columns', {
    params: { dashboardId },
  });
  return data;
}

/** 할 일 카드 목록 조회 (커서 기반 페이지네이션) */
export async function getCards(
  columnId: number,
  size = 10,
  cursorId?: number,
): Promise<CardsResponse> {
  const { data } = await api.get<CardsResponse>('/cards', {
    params: {
      columnId,
      size,
      ...(cursorId !== undefined ? { cursorId } : {}),
    },
  });
  return data;
}

/** 대시보드 멤버 목록 조회 */
export async function getMembers(
  dashboardId: number,
  page = 1,
  size = 20,
): Promise<MembersResponse> {
  const { data } = await api.get<MembersResponse>('/members', {
    params: { dashboardId, page, size },
  });
  return data;
}

/** 대시보드 멤버 삭제 */
export async function deleteMember(memberId: number): Promise<void> {
  await api.delete(`/members/${memberId}`);
}

/** 칼럼 생성 */
export async function createColumn(title: string, dashboardId: number) {
  const { data } = await api.post('/columns', { title, dashboardId });
  return data;
}

/** 칼럼 수정 */
export async function updateColumn(columnId: number, title: string) {
  const { data } = await api.put(`/columns/${columnId}`, { title });
  return data;
}

/** 칼럼 삭제 */
export async function deleteColumn(columnId: number) {
  await api.delete(`/columns/${columnId}`);
}

/** 카드 이미지 업로드 */
// api/cardImage.ts
export async function uploadCardImage(columnId: number, image: File) {
  const formData = new FormData();
  formData.append('image', image);

  const { data } = await api.post(`/columns/${columnId}/card-image`, formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
  return data;
}

/** 할 일 카드 조회 */
export async function readCard(cardId: number) {
  const { data } = await api.get(`/cards/${cardId}`);
  return data;
}

/** 할 일 카드 생성 */
export async function createCard(payload: {
  assigneeUserId?: number;
  dashboardId: number;
  columnId: number;
  title: string;
  description: string;
  dueDate?: string;
  tags?: string[];
  imageUrl?: string;
}) {
  const { data } = await api.post('/cards', payload);
  return data;
}

/** 할 일 카드 수정 */
export async function updateCard(
  cardId: number,
  payload: {
    columnId?: number;
    assigneeUserId?: number | null;
    title?: string;
    description?: string;
    dueDate?: string | null;
    tags?: string[];
    imageUrl?: string | null;
  },
) {
  const { data } = await api.put(`/cards/${cardId}`, payload);
  return data;
}

/** 할 일 카드 삭제 */
export async function deleteCard(cardId: number) {
  await api.delete(`/cards/${cardId}`);
}

/** 대시보드 초대하기 */
export async function inviteMember(dashboardId: number, email: string) {
  const { data } = await api.post(`/dashboards/${dashboardId}/invitations`, {
    email,
  });
  return data;
}

/** 대시보드 초대 목록 조회 */
export async function getInvitations(
  dashboardId: number,
  page = 1,
  size = 5,
): Promise<DashboardInvitationsResponse> {
  const { data } = await api.get<DashboardInvitationsResponse>(
    `/dashboards/${dashboardId}/invitations`,
    {
      params: { page, size },
    },
  );
  return data;
}

/** 대시보드 초대 취소 */
export async function deleteInvitation(
  dashboardId: number,
  invitationId: number,
): Promise<void> {
  await api.delete(`/dashboards/${dashboardId}/invitations/${invitationId}`);
}

/** 대시보드 삭제 */
export async function deleteDashboard(dashboardId: number): Promise<void> {
  await api.delete(`/dashboards/${dashboardId}`);
}

/** 내가 받은 초대 목록 조회 (무한 스크롤용) */
export async function getMyInvitations(
  size?: number,
  cursorId?: number | null,
): Promise<GetInvitationsResponse> {
  const { data } = await api.get<GetInvitationsResponse>('/invitations', {
    params: {
      size,
      ...(cursorId !== null && cursorId !== undefined && { cursorId }),
    },
  });
  return data;
}

/** 받은 초대에 대해 수락 또는 거절 응답 */
export async function respondToInvitation(
  invitationId: number,
  inviteAccepted: boolean,
): Promise<Invitation> {
  const { data } = await api.put<Invitation>(`/invitations/${invitationId}`, {
    inviteAccepted,
  });
  return data;
}

/** 댓글 목록 조회 */
export async function getComments(
  cardId: number,
  size = 10,
  cursorId?: number,
): Promise<CommentsResponse> {
  const { data } = await api.get<CommentsResponse>('/comments', {
    params: {
      cardId,
      size,
      ...(cursorId !== undefined ? { cursorId } : {}),
    },
  });
  return data;
}

/** 댓글 생성 조회 */
export async function createComments(payload: {
  content: string;
  cardId: number;
  columnId: number;
  dashboardId: number;
}) {
  const { data } = await api.post('/comments', payload);
  return data;
}

/** 댓글 수정 조회 */
export async function updateComments(commentId: number, content: string) {
  const { data } = await api.put(`/comments/${commentId}`, { content });
  return data;
}

/** 댓글 삭제 조회 */
export async function deleteComments(commentId: number) {
  await api.delete(`/comments/${commentId}`);
}
