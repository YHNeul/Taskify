import { cn } from '@/lib/utils';

interface SkeletonProps {
  className?: string;
  style?: React.CSSProperties;
}

export default function Skeleton({ className, style }: SkeletonProps) {
  return (
    <div
      className={cn('skeleton rounded bg-gray-200', className)}
      style={style}
    />
  );
}
