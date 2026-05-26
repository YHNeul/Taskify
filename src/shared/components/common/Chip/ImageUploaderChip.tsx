/**
 * @file ImageUploaderChip.tsx
 * @description 이미지 업로더의 기본 UI로 사용되는 컴포넌트입니다.
 * 할 일 카드와 계정 관리의 프로필 이미지 업로드에 사용됩니다.
 *
 * @example
 * ## 할 일 카드 > 이미지 👉 76
 * <ImageUploaderChip />
 *
 * ## 계정 관리 > 프로필 👉 182
 * <ImageUploaderChip size={182} />
 *
 * @author 수경
 */

import ImageUploaderChipSvg from '@/shared/assets/chips/ic-image-uploader-chip.svg';

interface Props {
  /**
   * 아이콘의 바탕(배경/<rect />) 사이즈를 제어합니다.
   * '+' 아이콘의 크기는 16.8로 고정입니다.
   * @default 76
   */
  size?: number;
}

export default function ImageUploaderChip({ size = 76 }: Props) {
  return <ImageUploaderChipSvg width={size} height={size} />;
}
