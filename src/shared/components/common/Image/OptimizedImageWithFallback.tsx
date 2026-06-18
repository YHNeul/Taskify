'use client';

import Image, { type ImageProps } from 'next/image';
import { type ReactNode, useState } from 'react';
import { cn } from '@/lib/utils';

interface OptimizedImageWithFallbackProps {
  src: string;
  alt: string;
  imageClassName?: string;
  skeletonClassName?: string;
  fallback?: ReactNode;
  isFadeEnabled?: boolean;
  isSkeletonVisible?: boolean;
  isFallbackVisibleWhileLoading?: boolean;
  onImageLoad?: () => void;
  onImageError?: () => void;
  imageProps?: Omit<ImageProps, 'src' | 'alt' | 'className'>;
}

interface StatefulImageProps extends OptimizedImageWithFallbackProps {
  imageKey: string;
}

function StatefulImage({
  src,
  alt,
  imageClassName,
  skeletonClassName,
  fallback = null,
  isFadeEnabled = true,
  isSkeletonVisible = true,
  isFallbackVisibleWhileLoading = false,
  onImageLoad,
  onImageError,
  imageProps,
}: StatefulImageProps) {
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);
  const [shouldUseUnoptimized, setShouldUseUnoptimized] = useState(false);
  const isRemoteSource = /^https?:\/\//.test(src);
  const isSrcInvalid = !src || src.trim() === '';

  if (hasError || isSrcInvalid) {
    return <>{fallback}</>;
  }

  return (
    <>
      {isFallbackVisibleWhileLoading && isLoading && fallback}
      {isSkeletonVisible && isLoading && (
        <div
          aria-hidden="true"
          className={cn(
            'absolute inset-0 animate-pulse bg-gray-200',
            skeletonClassName,
          )}
        />
      )}
      <Image
        {...imageProps}
        src={src}
        alt={alt}
        unoptimized={imageProps?.unoptimized ?? shouldUseUnoptimized}
        className={cn(
          imageClassName,
          isLoading ? 'opacity-0' : 'opacity-100',
          isFadeEnabled && 'transition-opacity',
        )}
        onLoad={(event) => {
          setIsLoading(false);
          onImageLoad?.();
          imageProps?.onLoad?.(event);
        }}
        onError={(event) => {
          if (
            isRemoteSource &&
            !shouldUseUnoptimized &&
            imageProps?.unoptimized !== true
          ) {
            // next/image 최적화 경로가 실패할 때 원본 URL로 1회 재시도
            setShouldUseUnoptimized(true);
            setIsLoading(true);
            return;
          }
          setHasError(true);
          setIsLoading(false);
          onImageError?.();
          imageProps?.onError?.(event);
        }}
      />
    </>
  );
}

export default function OptimizedImageWithFallback(
  props: OptimizedImageWithFallbackProps,
) {
  const imageKey = props.src;
  return <StatefulImage key={imageKey} imageKey={imageKey} {...props} />;
}
