import { Instagram } from "lucide-react";
import { shareToInstagram } from "@/lib/shareToInstagram";

interface ShareReviewButtonProps {
  authorName: string;
  rating: number;
  eventType: "taller" | "xerrada" | "presentacio" | "altra";
  content: string;
}

export function ShareReviewButton({
  authorName,
  rating,
  eventType,
  content,
}: ShareReviewButtonProps) {
  return (
    <button
      onClick={() =>
        shareToInstagram({
          authorName,
          rating,
          eventType,
          content,
          includeUrl: true,
        })
      }
      className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg font-semibold text-sm transition-all hover:scale-105"
      style={{
        background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
        color: "white",
      }}
      title="Compartir aquesta ressenya a Instagram"
    >
      <Instagram size={16} />
      Compartir
    </button>
  );
}
