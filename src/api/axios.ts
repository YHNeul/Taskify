/**
 * @file 공통 axios 인스턴스 세팅
 * @description 프로젝트 전체에서 사용할 API 통신 기본 설정을 정의합니다.
 * @note API 요청 시 로컬 스토리지에 있는 인증 토큰을 헤더에 자동으로 실어 보내는 인터셉터(Interceptor) 로직이 포함됩니다.
 */

import axios from 'axios';

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.request.use((config) => {
  if (typeof window !== 'undefined') {
    const token = localStorage.getItem('accessToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
  }
  return config;
});

export default api;
