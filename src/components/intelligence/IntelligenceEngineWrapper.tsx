import { Suspense } from "react";
import { IntelligenceEngine } from "@/pages/IntelligenceEngine";
import { PremiumLayout } from "@/components/layout/PremiumLayout";

const LoadingFallback = () => (
  <PremiumLayout 
    variant="intelligence" 
    density="comfortable" 
    maxWidth="2xl"
    className="min-h-screen bg-gradient-to-br from-bg-primary via-bg-secondary to-bg-primary"
  >
    {/* Header Skeleton */}
    <div className="mb-8 col-span-full">
      <div className="glass-tile p-6 border border-btc-primary/20 bg-gradient-to-r from-bg-secondary/50 to-bg-primary/50">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-btc-primary/20 rounded w-1/3"></div>
          <div className="h-4 bg-text-secondary/20 rounded w-3/4"></div>
          <div className="h-3 bg-text-muted/20 rounded w-1/2"></div>
        </div>
      </div>
    </div>

    {/* Engine Grid Skeletons */}
    {Array.from({ length: 7 }).map((_, i) => (
      <div key={i} className="glass-tile p-6 space-y-4 min-h-[400px] border border-btc-primary/10">
        <div className="animate-pulse space-y-4">
          <div className="flex justify-between items-center">
            <div className="h-5 bg-btc-primary/20 rounded w-2/3"></div>
            <div className="h-6 bg-btc-light/20 rounded w-16"></div>
          </div>
          <div className="space-y-3">
            <div className="h-4 bg-btc-primary/20 rounded w-1/3"></div>
            {Array.from({ length: 4 }).map((_, j) => (
              <div key={j} className="flex justify-between">
                <div className="h-3 bg-text-secondary/20 rounded w-1/4"></div>
                <div className="h-3 bg-text-primary/20 rounded w-1/6"></div>
              </div>
            ))}
          </div>
        </div>
      </div>
    ))}

    {/* Footer Skeleton */}
    <div className="col-span-full mt-8">
      <div className="glass-tile p-6 border border-btc-primary/20">
        <div className="animate-pulse">
          <div className="h-4 bg-btc-primary/20 rounded w-full max-w-md mx-auto"></div>
        </div>
      </div>
    </div>
  </PremiumLayout>
);

export const IntelligenceEngineWrapper = () => (
  <Suspense fallback={<LoadingFallback />}>
    <IntelligenceEngine />
  </Suspense>
);