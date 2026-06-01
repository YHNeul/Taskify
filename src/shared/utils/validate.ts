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

const passwordLetterAndNumberRegex = /^(?=.*[A-Za-z])(?=.*\d)\S+$/;
const passwordTripleRepeatRegex = /(.)\1\1/;
export const PASSWORD_TRIPLE_REPEAT_ERROR_MESSAGE =
  '동일 문자를 3회 이상 연속 사용할 수 없습니다.';
export const PASSWORD_LETTER_AND_NUMBER_ERROR_MESSAGE =
  '영문과 숫자를 모두 포함해 주세요.';

export const validatePasswordHasLetterAndNumber = (
  password: string,
): boolean => {
  return passwordLetterAndNumberRegex.test(password);
};

export const validatePasswordNoTripleRepeat = (password: string): boolean => {
  return !passwordTripleRepeatRegex.test(password);
};

export const validatePasswordPolicy = (password: string): boolean => {
  return (
    validatePasswordHasLetterAndNumber(password) &&
    validatePasswordNoTripleRepeat(password)
  );
};
