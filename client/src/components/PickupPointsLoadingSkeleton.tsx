export function PickupPointsLoadingSkeleton() {
  return (
    <div className="min-h-screen" style={{ background: "oklch(0.97 0.01 55)" }}>
      {/* Map skeleton */}
      <div className="mb-12">
        <div className="h-8 w-64 rounded-lg mb-4 animate-pulse" style={{ background: "oklch(0.8 0.05 55)" }} />
        <div className="w-full h-[500px] rounded-2xl overflow-hidden shadow-lg animate-pulse" style={{ background: "oklch(0.85 0.04 55)" }} />
      </div>

      {/* Info box skeleton */}
      <div className="mb-8 p-6 rounded-2xl" style={{ background: "oklch(0.88 0.06 75 / 0.5)" }}>
        <div className="h-4 w-40 rounded animate-pulse" style={{ background: "oklch(0.7 0.05 55)" }} />
      </div>

      {/* Cards skeleton */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {[1, 2, 3].map((i) => (
          <div
            key={i}
            className="rounded-2xl p-6 shadow-lg"
            style={{ background: "white", border: "2px solid oklch(0.78 0.07 70 / 0.5)" }}
          >
            {/* Title skeleton */}
            <div className="h-6 w-32 rounded mb-4 animate-pulse" style={{ background: "oklch(0.8 0.05 55)" }} />

            {/* Badge skeleton */}
            <div className="h-5 w-20 rounded-full mb-4 animate-pulse" style={{ background: "oklch(0.8 0.05 55)" }} />

            {/* Address skeleton */}
            <div className="flex gap-3 mb-3">
              <div className="w-5 h-5 rounded flex-shrink-0 animate-pulse" style={{ background: "oklch(0.8 0.05 55)" }} />
              <div className="flex-1">
                <div className="h-4 w-full rounded mb-2 animate-pulse" style={{ background: "oklch(0.8 0.05 55)" }} />
                <div className="h-4 w-3/4 rounded animate-pulse" style={{ background: "oklch(0.8 0.05 55)" }} />
              </div>
            </div>

            {/* Phone skeleton */}
            <div className="flex gap-3 mb-3">
              <div className="w-5 h-5 rounded flex-shrink-0 animate-pulse" style={{ background: "oklch(0.8 0.05 55)" }} />
              <div className="h-4 w-32 rounded animate-pulse" style={{ background: "oklch(0.8 0.05 55)" }} />
            </div>

            {/* Email skeleton */}
            <div className="flex gap-3">
              <div className="w-5 h-5 rounded flex-shrink-0 animate-pulse" style={{ background: "oklch(0.8 0.05 55)" }} />
              <div className="h-4 w-40 rounded animate-pulse" style={{ background: "oklch(0.8 0.05 55)" }} />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
