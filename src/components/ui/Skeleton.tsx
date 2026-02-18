type SkeletonProps = {
  className?: string;
};

export function SkeletonBlock({ className = "" }: SkeletonProps) {
  return (
    <div
      className={`bg-border animate-pulse rounded-xl ${className}`}
    />
  );
}

export function SkeletonText({ className = "" }: SkeletonProps) {
  return (
    <div
      className={`bg-border animate-pulse rounded h-4 ${className}`}
    />
  );
}
