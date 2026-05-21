/**
 * @file 날짜 포맷팅 유틸 함수
 * @description 서버에서 내려오는 ISO 날짜 문자열을 UI에 맞는 형식(예: YYYY-MM-DD)으로 변환합니다.
 * UTC 기준이 아닌 한국 시간으로 변환됩니다.
 */

/** YYYY-MM-DD 형식 */
export const formatDate = (isoString?: string | null): string => {
  if (!isoString) return '-';

  const date = new Date(isoString);
  if (isNaN(date.getTime())) return '-';

  const year = date.getUTCFullYear();
  const month = String(date.getUTCMonth() + 1).padStart(2, '0');
  const day = String(date.getUTCDate()).padStart(2, '0');

  return `${year}-${month}-${day}`;
};

/** YYYY-MM-DD HH:mm 형식 */
export const formatDateTime = (isoString?: string | null): string => {
  if (!isoString) return '-';

  const date = new Date(isoString);
  if (isNaN(date.getTime())) return '-';

  const year = date.getUTCFullYear();
  const month = String(date.getUTCMonth() + 1).padStart(2, '0');
  const day = String(date.getUTCDate()).padStart(2, '0');

  const hours = String(date.getUTCHours()).padStart(2, '0');
  const minutes = String(date.getUTCMinutes()).padStart(2, '0');

  return `${year}-${month}-${day} ${hours}:${minutes}`;
};
