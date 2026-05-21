/**
 * @file 폼 유효성 검사 유틸 함수
 * @description 이메일, 비밀번호 형식 등 정규표현식을 활용해 입력값이 올바른지 검사하는 함수들입니다.
 * @returns {boolean} 유효성 검사 통과 여부 (true/false)
 */

export const validateDashboardName = (name: string): boolean => {
  const trimmedName = name.trim();
  if (trimmedName.length < 2) return false;
  const isValidPattern = /^[a-zA-Z0-9가-힣\s]+$/.test(trimmedName);
  return isValidPattern;
};
