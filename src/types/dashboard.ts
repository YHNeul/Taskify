/**
 * @file 대시보드 도메인 타입 정의
 * @description 대시보드(Dashboard), 칼럼(Column), 할 일 카드(Card)의 데이터 구조(interface)를 모아둔 파일입니다.
 * @note 백엔드 API 명세서의 Response 응답값과 정확히 일치하도록 타입을 정의해야 합니다.
 */

/** 초대받은 대시보드 */
export interface Invitation {
  id: number;
  inviter: Pick<Member, 'nickname' | 'email' | 'id'>;
  teamId: string;
  dashboard: Pick<Dashboard, 'id' | 'title'>;
  invitee: Pick<Member, 'nickname' | 'email' | 'id'>;
  inviteAccepted: boolean | null;
  createdAt: string;
  updatedAt: string;
}

/** GET /invitations 응답 */
export interface GetInvitationsResponse {
  cursorId: number | null;
  invitations: Invitation[];
}

/** 대시보드 초대 목록 조회 응답 */
export interface DashboardInvitationsResponse {
  totalCount: number;
  invitations: Invitation[];
}

/** 대시보드 (한 개) */
export interface Dashboard {
  id: number;
  title: string;
  color: string;
  createdAt: string;
  updatedAt: string;
  /** 내가 만든 대시보드 여부 */
  createdByMe: boolean;
  userId: number;
}

/** 컬럼 (한 개) */
export interface Column {
  id: number;
  title: string;
  teamId: string;
  dashboardId: number;
  createdAt: string;
  updatedAt: string;
}

/** GET /columns 응답 */
export interface ColumnsResponse {
  result: string;
  data: Column[];
}

/** 할 일 카드의 담당자 */
export interface Assignee {
  profileImageUrl: string | null;
  nickname: string;
  id: number;
}

/** 할 일 카드 (한 개) */
export interface Card {
  id: number;
  title: string;
  description: string;
  tags: string[];
  dueDate: string | null;
  assignee: Assignee | null;
  imageUrl: string | null;
  teamId: string;
  columnId: number;
  dashboardId: number;
  createdAt: string;
  updatedAt: string;
}

/** GET /cards 응답 (커서 기반 페이지네이션) */
export interface CardsResponse {
  cursorId: number | null;
  totalCount: number;
  cards: Card[];
}

/** 대시보드 멤버 */
export interface Member {
  id: number;
  userId: number;
  email: string;
  nickname: string;
  profileImageUrl: string | null;
  createdAt: string;
  updatedAt: string;
  isOwner: boolean;
}

/** GET /members 응답 */
export interface MembersResponse {
  members: Member[];
  totalCount: number;
}

/** GET /dashboards 응답 */
export interface DashboardsResponse {
  cursorId: number | null;
  totalCount: number;
  dashboards: Dashboard[];
}

/** 댓글 */
export interface Comments {
  id: number;
  content: string;
  createdAt: string;
  updatedAt: string;
  cardId: number;
  author: {
    profileImageUrl: string | null;
    nickname: string;
    id: number;
  };
}

/** GET /comments 응답 */
export interface CommentsResponse {
  cursorId: number | null;
  comments: Comments[];
}
