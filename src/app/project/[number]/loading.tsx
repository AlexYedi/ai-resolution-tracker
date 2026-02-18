import { SkeletonBlock, SkeletonText } from "@/components/ui/Skeleton";

export default function ProjectLoading() {
  return (
    <div className="max-w-5xl mx-auto px-6 py-12">
      {/* Breadcrumb skeleton */}
      <SkeletonText className="h-4 w-48 mb-6" />

      {/* Header skeleton */}
      <SkeletonText className="h-3 w-24 mb-3" />
      <SkeletonText className="h-8 w-96 mb-2" />
      <SkeletonText className="h-5 w-72 mb-8" />

      {/* Deliverable card skeleton */}
      <SkeletonBlock className="h-20 mb-10" />

      {/* Two column skeleton */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-10 mb-12">
        <div className="lg:col-span-3 space-y-4">
          <SkeletonText className="h-6 w-32" />
          <SkeletonBlock className="h-32" />
          <SkeletonText className="h-6 w-32 mt-6" />
          <SkeletonBlock className="h-20" />
        </div>
        <div className="lg:col-span-2 space-y-4">
          <SkeletonText className="h-6 w-32" />
          <SkeletonBlock className="h-24" />
          <SkeletonText className="h-6 w-32 mt-6" />
          <SkeletonBlock className="h-24" />
        </div>
      </div>

      {/* Iterations skeleton */}
      <SkeletonText className="h-7 w-40 mb-6" />
      <div className="space-y-4">
        {[...Array(3)].map((_, i) => (
          <SkeletonBlock key={i} className="h-20" />
        ))}
      </div>
    </div>
  );
}
