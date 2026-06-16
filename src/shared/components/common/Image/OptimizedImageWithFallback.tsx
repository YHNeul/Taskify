'use client';

import Image, { type ImageProps } from 'next/image';
import { type ReactNode, useState } from 'react';
import clsx from 'clsx';

interface OptimizedImageWithFallbackProps {
  src: string;
  alt: string;
  imageClassName?: string;
  skeletonClassName?: string;
  fallback?: ReactNode;
  withFade?: boolean;
  showSkeleton?: boolean;
  showFallbackWhileLoading?: boolean;
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
  withFade = true,
  showSkeleton = true,
  showFallbackWhileLoading = false,
  onImageLoad,
  onImageError,
  imageProps,
}: StatefulImageProps) {
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);

  if (hasError) {
    return <>{fallback}</>;
  }

  return (
    <>
      {showFallbackWhileLoading && isLoading && fallback}
      {showSkeleton && isLoading && (
        <div
          aria-hidden="true"
          className={clsx(
            'absolute inset-0 animate-pulse bg-gray-200',
            skeletonClassName,
          )}
        />
      )}
      <Image
        {...imageProps}
        src={src}
        alt={alt}
        className={clsx(
          imageClassName,
          isLoading ? 'opacity-0' : 'opacity-100',
          withFade && 'transition-opacity',
        )}
        onLoadStart={(event) => {
          setIsLoading(true);
          imageProps?.onLoadStart?.(event);
        }}
        onLoad={(event) => {
          setIsLoading(false);
          onImageLoad?.();
          imageProps?.onLoad?.(event);
        }}
        onError={(event) => {
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
