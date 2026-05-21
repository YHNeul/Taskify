// 로그인, 회원가입 관련 API 함수 모음

import api from './axios';

export interface Me {
  id: number;
  email: string;
  nickname: string;
  profileImageUrl: string | null;
  createdAt: string;
  updatedAt: string;
}

export async function getMe(): Promise<Me> {
  const { data } = await api.get<Me>('/users/me');
  return data;
}
