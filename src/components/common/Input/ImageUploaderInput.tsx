'use client';

/**
 * @file ImageUploaderInput.tsx
 * @description 이미지 업로드 및 미리보기 컴포넌트입니다.
 *
 * @author 수경
 *
 * @example
 * <ImageUploaderInput />
 * <ImageUploaderInput
 *  size={178}
 *  onUpload={(url) =>
 *    setFormData((prev) => ({ ...prev, imageUrl: url }))
 *  />
 */

import { useEffect, useRef, useState } from 'react';
import ImageUploaderChip from '../Chip/ImageUploaderChip';
import Image from 'next/image';
// import heic2any from 'heic2any';

interface Props {
  /**
   * 버튼 크기 및 미리보기 이미지 사이즈를 제어합니다.
   * @default 76
   */
  size?: number;
  /** 이미지 업로드 후 URL을 부모 컴포넌트로 전달하는 콜백 함수 */
  onUpload: (file: File | null) => void;
  defaultUrl?: string | null;
}

const ALLOWED_TYPES = [
  'image/jpeg',
  'image/png',
  'image/gif',
  'image/webp',
  'image/svg+xml',
];
const HEIC_TYPES = ['image/heic', 'image/heif'];

/** HEIC 파일을 JPEG File 객체로 변환합니다. */
async function convertHeicToJpeg(file: File): Promise<File> {
  const heic2any = (await import('heic2any')).default;
  const converted = await heic2any({ blob: file, toType: 'image/jpeg' });
  const blob = Array.isArray(converted) ? converted[0] : converted;
  const fileName = file.name.replace(/\.heic$/i, '.jpg');
  return new File([blob], fileName, { type: 'image/jpeg' });
}

/**
 * 이미지 업로드 및 미리보기 컴포넌트입니다.
 */
export default function ImageUploaderInput({
  size = 76,
  onUpload,
  defaultUrl = null,
}: Props) {
  // const [file, setFile] = useState<File | null>(null);
  const [imageUrl, setImageUrl] = useState<string>(defaultUrl ?? '');
  const [isConverting, setIsConverting] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  /** 파일(input[type="file"]) 변경 시 실행되는 핸들러 */
  const handleChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = e.target.files?.[0];

    // input value 초기화 — 같은 파일 재선택 시에도 onChange가 트리거되도록
    e.target.value = '';

    if (!selected) {
      setImageUrl('');
      onUpload(null);
      return;
    }

    const isHeic =
      HEIC_TYPES.includes(selected.type) || /\.heic$/i.test(selected.name);

    if (!isHeic && !ALLOWED_TYPES.includes(selected.type)) {
      alert('JPG, PNG, GIF, WEBP, SVG 파일만 업로드할 수 있습니다.');
      return;
    }

    // HEIC 변환
    if (isHeic) {
      setIsConverting(true);
      try {
        const jpegFile = await convertHeicToJpeg(selected);
        const blobUrl = URL.createObjectURL(jpegFile);
        setImageUrl(blobUrl);
        onUpload(jpegFile);
      } catch {
        alert(
          'HEIC 파일 변환에 실패했습니다. 다른 형식으로 변환 후 업로드해주세요.',
        );
      } finally {
        setIsConverting(false);
      }
      return;
    }

    const blobUrl = URL.createObjectURL(selected);
    setImageUrl(blobUrl);
    onUpload(selected);
  };

  /** 업로드 버튼 클릭 시 숨겨진 input[type="file"]을 트리거하는 함수 */
  const handleUploadClick = () => {
    // ✅ 클릭 시점에 바로 초기화
    setImageUrl('');
    onUpload(null);
    inputRef.current?.click();
  };

  // imageUrl이 바뀔 때마다 이전 blob URL 메모리 해제
  useEffect(() => {
    return () => {
      if (imageUrl.startsWith('blob:')) URL.revokeObjectURL(imageUrl);
    };
  }, [imageUrl]);

  return (
    <div>
      {/* 숨겨진 input */}
      <input
        type="file"
        accept={[...ALLOWED_TYPES, ...HEIC_TYPES].join(',')}
        onChange={handleChange}
        ref={inputRef}
        className="hidden"
      />

      {/* 버튼, 이미지 UI */}
      <button
        type="button"
        onClick={handleUploadClick}
        className="relative group"
        style={{ width: size, height: size }}
      >
        {/* 이미지 업로드 여부에 따라 미리보기 또는 업로드 버튼 UI 렌더링 */}
        {isConverting ? (
          <div className="w-full h-full flex items-center justify-center rounded-md bg-gray-100">
            <span className="text-xs text-gray-400">변환 중...</span>
          </div>
        ) : imageUrl ? (
          <>
            <Image
              src={imageUrl}
              alt="이미지 미리보기"
              fill
              className="object-cover rounded-md"
              unoptimized
            />
            {/* hover 오버레이 */}
            <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition rounded-md flex items-center justify-center">
              <svg
                width="22"
                height="22"
                viewBox="0 0 22 22"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M1.12981 21.2499C0.809708 21.2499 0.541385 21.1417 0.324843 20.9251C0.108281 20.7086 0 20.4402 0 20.1201V17.9543C0 17.6495 0.0584999 17.3589 0.1755 17.0827C0.292479 16.8064 0.453531 16.5657 0.658656 16.3606L16.488 0.538469C16.677 0.366782 16.8857 0.234114 17.1141 0.140469C17.3425 0.0468228 17.582 0 17.8327 0C18.0833 0 18.326 0.0444798 18.561 0.133438C18.7959 0.222376 19.0039 0.363792 19.185 0.557688L20.7115 2.10334C20.9054 2.28443 21.0436 2.4928 21.1261 2.72847C21.2087 2.96412 21.2499 3.19976 21.2499 3.43541C21.2499 3.68676 21.207 3.92664 21.1212 4.15503C21.0353 4.38345 20.8988 4.59217 20.7115 4.78119L4.88934 20.5913C4.68422 20.7964 4.44353 20.9575 4.16728 21.0744C3.89101 21.1914 3.60046 21.2499 3.29562 21.2499H1.12981ZM17.5649 5.24275L19.375 3.44466L17.8053 1.87497L16.0072 3.68506L17.5649 5.24275Z"
                  fill="white"
                />
              </svg>
            </div>
          </>
        ) : (
          <ImageUploaderChip size={size} />
        )}
      </button>
    </div>
  );
}
