import React from "react";
import { Compass, AlertTriangle, RefreshCw, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";

export interface DataStateProps {
  loading?: boolean;
  error?: string | null;
  empty?: boolean;
  emptyTitle?: string;
  emptyMessage?: string;
  variant?: "destination" | "hotel" | "guide" | "list";
  count?: number;
  onRetry?: () => void;
  onResetFilters?: () => void;
  children?: React.ReactNode;
}

export function LoadingBlock({ label = "Loading..." }: { label?: string }) {
  return (
    <div className="py-16 text-center text-muted-foreground">
      <div className="mx-auto mb-3 h-8 w-8 animate-spin rounded-full border-b-2 border-primary" />
      {label}
    </div>
  );
}

export function ErrorBlock({
  message,
  onRetry,
}: {
  message: string;
  onRetry?: () => void;
}) {
  return (
    <div className="py-16 text-center">
      <p className="mb-4 text-destructive">{message}</p>
      {onRetry && (
        <Button variant="outline" onClick={onRetry}>
          Try again
        </Button>
      )}
    </div>
  );
}

export function EmptyBlock({
  title,
  hint,
}: {
  title: string;
  hint?: string;
}) {
  return (
    <div className="py-12 text-center">
      <h3 className="text-lg font-semibold">{title}</h3>
      {hint && <p className="mt-1 text-sm text-muted-foreground">{hint}</p>}
    </div>
  );
}

export const DataState: React.FC<DataStateProps> = ({
  loading = false,
  error = null,
  empty = false,
  emptyTitle = "No matching experiences found",
  emptyMessage = "Try adjusting your search filters or exploring a different region of Bharat.",
  variant = "destination",
  count = 8,
  onRetry,
  onResetFilters,
  children,
}) => {
  /* 1. SHIMMER SKELETON LOADING STATE */
  if (loading) {
    if (variant === "list") {
      return (
        <div className="space-y-4">
          {Array.from({ length: count }).map((_, i) => (
            <div
              key={i}
              className="flex flex-col gap-4 rounded-2xl border border-border/60 bg-card p-5 sm:flex-row sm:items-center"
            >
              <Skeleton className="h-24 w-full rounded-xl sm:w-36" />
              <div className="flex-1 space-y-2.5">
                <Skeleton className="h-5 w-1/3 rounded-lg" />
                <Skeleton className="h-4 w-2/3 rounded-lg" />
                <Skeleton className="h-4 w-1/4 rounded-lg" />
              </div>
            </div>
          ))}
        </div>
      );
    }

    return (
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: count }).map((_, i) => (
          <div
            key={i}
            className="overflow-hidden rounded-2xl border border-border/60 bg-card shadow-sm"
          >
            {variant === "destination" ? (
              <div className="relative aspect-[4/5] w-full p-5">
                <Skeleton className="absolute inset-0 h-full w-full rounded-none" />
                <div className="relative z-10 flex h-full flex-col justify-between">
                  <div className="flex justify-between">
                    <Skeleton className="h-6 w-20 rounded-full bg-white/30" />
                    <Skeleton className="h-9 w-9 rounded-full bg-white/30" />
                  </div>
                  <div className="space-y-2">
                    <Skeleton className="h-4 w-24 bg-white/30" />
                    <Skeleton className="h-7 w-3/4 bg-white/30" />
                    <Skeleton className="h-4 w-full bg-white/30" />
                  </div>
                </div>
              </div>
            ) : variant === "guide" ? (
              <div className="space-y-4 p-5">
                <div className="flex items-center gap-4">
                  <Skeleton className="h-16 w-16 rounded-2xl" />
                  <div className="flex-1 space-y-2">
                    <Skeleton className="h-5 w-3/4" />
                    <Skeleton className="h-3.5 w-1/2" />
                    <Skeleton className="h-5 w-24 rounded-full" />
                  </div>
                </div>
                <Skeleton className="h-10 w-full rounded-lg" />
                <div className="flex items-center justify-between border-t border-border/50 pt-3">
                  <Skeleton className="h-6 w-20" />
                  <Skeleton className="h-9 w-28 rounded-xl" />
                </div>
              </div>
            ) : (
              /* Hotel Skeleton */
              <div>
                <Skeleton className="aspect-[16/10] w-full rounded-none" />
                <div className="space-y-3 p-5">
                  <Skeleton className="h-6 w-3/4" />
                  <div className="flex gap-2">
                    <Skeleton className="h-6 w-16 rounded-lg" />
                    <Skeleton className="h-6 w-20 rounded-lg" />
                  </div>
                  <div className="flex items-center justify-between border-t border-border/50 pt-4">
                    <Skeleton className="h-7 w-24" />
                    <Skeleton className="h-9 w-24 rounded-xl" />
                  </div>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    );
  }

  /* 2. ERROR STATE (Cold-Start / Network Friendly) */
  if (error) {
    return (
      <div className="mx-auto my-8 flex max-w-lg flex-col items-center justify-center rounded-3xl border border-destructive/30 bg-destructive/5 p-8 text-center">
        <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-destructive/15 text-destructive">
          <AlertTriangle className="h-7 w-7" />
        </div>
        <h3 className="mt-4 font-serif-display text-xl font-bold text-foreground">
          Unable to load travel data
        </h3>
        <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
          {error ||
            "Our server may be waking up from a brief rest. Please try refreshing in a few seconds."}
        </p>
        {onRetry && (
          <Button onClick={onRetry} className="mt-5 rounded-xl font-semibold">
            <RefreshCw className="mr-2 h-4 w-4" /> Try Again
          </Button>
        )}
      </div>
    );
  }

  /* 3. EMPTY RESULTS STATE */
  if (empty) {
    return (
      <div className="mx-auto my-8 flex max-w-lg flex-col items-center justify-center rounded-3xl border border-dashed border-border bg-card/60 p-10 text-center">
        <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/15 text-primary">
          <Compass className="h-7 w-7" />
        </div>
        <h3 className="mt-4 font-serif-display text-2xl font-bold text-foreground">
          {emptyTitle}
        </h3>
        <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
          {emptyMessage}
        </p>
        {onResetFilters && (
          <Button
            variant="outline"
            onClick={onResetFilters}
            className="mt-5 rounded-xl font-semibold"
          >
            <Sparkles className="mr-2 h-4 w-4 text-primary" /> Reset All Filters
          </Button>
        )}
      </div>
    );
  }

  return <>{children}</>;
};

export default DataState;