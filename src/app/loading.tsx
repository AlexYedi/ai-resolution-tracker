import { SkeletonBlock, SkeletonText } from "@/components/ui/Skeleton";

export default function HomeLoading() {
  return (
    <div className="max-w-6xl mx-auto px-6 py-16">
      {/* Hero skeleton */}
      <div className="text-center mb-12">
        <SkeletonText className="h-10 w-80 mx-auto mb-4" />
        <SkeletonText className="h-5 w-64 mx-auto" />
      </div>

      {/* Stats grid skeleton */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        {[...Array(4)].map((_, i) => (
          <SkeletonBlock key={i} className="h-24" />
        ))}
      </div>

      {/* Progress bar skeleton */}
      <SkeletonBlock className="h-6 mb-12" />

      {/* Project grid skeleton */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {[...Array(6)].map((_, i) => (
          <SkeletonBlock key={i} className="h-48" />
        ))}
      </div>
    </div>
  );
}
