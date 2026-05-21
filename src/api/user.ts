import api from './axios';
import type { User } from '@/types/user';

export interface UpdateMyInfoPayload {
  nickname?: string;
  profileImageUrl?: string | null;
}

export interface UploadProfileImageResponse {
  profileImageUrl: string;
}

/** 내 정보 조회 */
export async function getMyInfo(): Promise<User> {
  const { data } = await api.get<User>('/users/me');
  return data;
}

/** 프로필 이미지 업로드 */
export async function uploadProfileImage(
  imageFile: File,
): Promise<UploadProfileImageResponse> {
  const formData = new FormData();
  formData.append('image', imageFile);

  const { data } = await api.post<UploadProfileImageResponse>(
    '/users/me/image',
    formData,
    {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    },
  );

  return data;
}

/** 내 정보 수정 */
export async function updateMyInfo(
  payload: UpdateMyInfoPayload,
): Promise<User> {
  const { data } = await api.put<User>('/users/me', payload);
  return data;
}

export interface ChangePasswordPayload {
  password: string;
  newPassword: string;
}

/** 비밀번호 변경 */
export async function changePassword(
  payload: ChangePasswordPayload,
): Promise<void> {
  await api.put('/auth/password', payload);
}
