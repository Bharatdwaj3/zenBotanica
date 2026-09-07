import React from 'react';
import Skeleton from './Skeleton';

export default function SpecimenGridSkeleton({ count = 6 }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="bg-[#12201b] border border-[#1a2e28] rounded-2xl p-4 flex flex-col gap-4">
          {/* Cover Image Skeleton */}
          <Skeleton width="w-full" height="h-48" rounded="rounded-xl" />
          
          {/* Title Skeleton */}
          <Skeleton width="w-3/4" height="h-6" rounded="rounded-md" />
          
          {/* Author/Cultivator Skeleton */}
          <Skeleton width="w-1/2" height="h-4" rounded="rounded-md" />
          
          {/* Genre/Category Skeleton */}
          <div className="flex gap-2 mt-2">
            <Skeleton width="w-16" height="h-6" rounded="rounded-full" />
            <Skeleton width="w-20" height="h-6" rounded="rounded-full" />
          </div>

          {/* Footer/Action Skeleton */}
          <div className="mt-auto pt-4 border-t border-[#1a2e28] flex justify-between items-center">
            <Skeleton width="w-24" height="h-4" rounded="rounded-md" />
            <Skeleton width="w-8" height="h-8" rounded="rounded-full" />
          </div>
        </div>
      ))}
    </div>
  );
}
