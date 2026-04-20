import { useState, useEffect } from "react";
import { trpc } from "@/lib/trpc";
import { ChevronLeft, ChevronRight } from "lucide-react";

export function WorkshopReviewsCarousel() {
  const { data: reviews = [] } = trpc.workshopReviews.listApproved.useQuery();
  const [activeIdx, setActiveIdx] = useState(0);

  useEffect(() => {
    if (reviews.length === 0) return;
    const timer = setInterval(() => {
      setActiveIdx((prev) => (prev + 1) % reviews.length);
    }, 5000);
    return () => clearInterval(timer);
  }, [reviews.length]);

  if (reviews.length === 0) {
    return null;
  }

  const review = reviews[activeIdx];
  const eventTypeLabels: Record<string, string> = {
    taller: "🎓 Taller",
    xerrada: "🎤 Xerrada",
    presentacio: "📺 Presentació",
    altra: "✨ Event",
  };

  return (
    <div className="max-w-2xl mx-auto">
      <div className="rounded-3xl p-8 shadow-lg" style={{ background: "white", border: "2px solid oklch(0.72 0.08 200 / 0.2)" }}>
        {/* Estels */}
        <div className="flex justify-center gap-1 mb-4">
          {[1, 2, 3, 4, 5].map((star) => (
            <span
              key={star}
              className="text-xl"
              style={{ color: star <= review.rating ? "oklch(0.72 0.08 200)" : "oklch(0.78 0.07 70)" }}
            >
              ★
            </span>
          ))}
        </div>

        {/* Contingut */}
        <p className="text-center mb-4 italic" style={{ color: "oklch(0.5 0.05 55)" }}>
          "{review.content}"
        </p>

        {/* Autor */}
        <div className="text-center mb-4">
          <p className="font-bold" style={{ color: "oklch(0.35 0.07 55)" }}>
            {review.authorName}
          </p>
          <p className="text-sm" style={{ color: "oklch(0.5 0.05 55)" }}>
            {eventTypeLabels[review.eventType]} — {review.eventTitle}
          </p>
        </div>

        {/* Navegació */}
        <div className="flex justify-center items-center gap-4">
          <button
            onClick={() => setActiveIdx((prev) => (prev - 1 + reviews.length) % reviews.length)}
            className="p-2 rounded-full transition-colors hover:bg-gray-100"
          >
            <ChevronLeft size={20} style={{ color: "oklch(0.72 0.08 200)" }} />
          </button>

          <div className="flex gap-2">
            {reviews.map((_, i) => (
              <button
                key={i}
                onClick={() => setActiveIdx(i)}
                className="w-2 h-2 rounded-full transition-all"
                style={{
                  background: activeIdx === i ? "oklch(0.72 0.08 200)" : "oklch(0.78 0.07 70 / 0.5)",
                  transform: activeIdx === i ? "scale(1.3)" : "scale(1)",
                }}
              />
            ))}
          </div>

          <button
            onClick={() => setActiveIdx((prev) => (prev + 1) % reviews.length)}
            className="p-2 rounded-full transition-colors hover:bg-gray-100"
          >
            <ChevronRight size={20} style={{ color: "oklch(0.72 0.08 200)" }} />
          </button>
        </div>
      </div>
    </div>
  );
}
