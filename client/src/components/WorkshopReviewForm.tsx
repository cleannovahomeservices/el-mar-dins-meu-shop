import { useState } from "react";
import { Button } from "@/components/ui/button";
import { trpc } from "@/lib/trpc";
import { Star } from "lucide-react";
import { ThankYouAnimation } from "./ThankYouAnimation";

export function WorkshopReviewForm() {
  const [formData, setFormData] = useState({
    authorName: "",
    email: "",
    eventType: "taller" as "taller" | "xerrada" | "presentacio" | "altra",
    eventTitle: "",
    rating: 5,
    content: "",
  });

  const [submitted, setSubmitted] = useState(false);
  const submitMutation = trpc.workshopReviews.submit.useMutation();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await submitMutation.mutateAsync({
        authorName: formData.authorName,
        email: formData.email || undefined,
        eventType: formData.eventType,
        eventTitle: formData.eventTitle,
        rating: formData.rating,
        content: formData.content,
      });
      setSubmitted(true);
      setFormData({
        authorName: "",
        email: "",
        eventType: "taller",
        eventTitle: "",
        rating: 5,
        content: "",
      });
      setTimeout(() => setSubmitted(false), 5000);
    } catch (error) {
      console.error("Error submitting review:", error);
    }
  };

  if (submitted) {
    return (
      <>
        <ThankYouAnimation
          authorName={formData.authorName}
          rating={formData.rating}
          eventType={formData.eventType as any}
          content={formData.content}
        />
        <div className="rounded-2xl p-6 text-center" style={{ background: "oklch(0.88 0.06 75 / 0.9)" }}>
          <p className="font-bold" style={{ color: "oklch(0.35 0.07 55)" }}>
            ✅ Gràcies per la teva ressenya! Apareixerà en breu després de la moderació.
          </p>
        </div>
      </>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="rounded-2xl p-6 space-y-4" style={{ background: "white", border: "2px solid oklch(0.78 0.07 70 / 0.5)" }}>
      <div>
        <label className="block text-sm font-bold mb-2" style={{ color: "oklch(0.35 0.07 55)" }}>
          El teu nom *
        </label>
        <input
          type="text"
          required
          value={formData.authorName}
          onChange={(e) => setFormData({ ...formData, authorName: e.target.value })}
          className="w-full px-4 py-2 rounded-lg border"
          placeholder="Nom complet"
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-bold mb-2" style={{ color: "oklch(0.35 0.07 55)" }}>
            Tipus d'event *
          </label>
          <select
            required
            value={formData.eventType}
            onChange={(e) => setFormData({ ...formData, eventType: e.target.value as any })}
            className="w-full px-4 py-2 rounded-lg border"
          >
            <option value="taller">Taller</option>
            <option value="xerrada">Xerrada</option>
            <option value="presentacio">Presentació</option>
            <option value="altra">Altra</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-bold mb-2" style={{ color: "oklch(0.35 0.07 55)" }}>
            Valoració *
          </label>
          <div className="flex gap-1">
            {[1, 2, 3, 4, 5].map((star) => (
              <button
                key={star}
                type="button"
                onClick={() => setFormData({ ...formData, rating: star })}
                className="transition-transform hover:scale-110"
              >
                <Star
                  size={24}
                  fill={star <= formData.rating ? "currentColor" : "none"}
                  style={{ color: star <= formData.rating ? "oklch(0.72 0.08 200)" : "oklch(0.78 0.07 70)" }}
                />
              </button>
            ))}
          </div>
        </div>
      </div>

      <div>
        <label className="block text-sm font-bold mb-2" style={{ color: "oklch(0.35 0.07 55)" }}>
          La teva opinió *
        </label>
        <textarea
          required
          value={formData.content}
          onChange={(e) => setFormData({ ...formData, content: e.target.value })}
          className="w-full px-4 py-2 rounded-lg border"
          rows={4}
          placeholder="Comparteix la teva experiència..."
          maxLength={2000}
        />
        <p className="text-xs mt-1" style={{ color: "oklch(0.55 0.04 55)" }}>
          {formData.content.length}/2000 caràcters
        </p>
      </div>

      <Button
        type="submit"
        disabled={submitMutation.isPending}
        className="w-full"
        style={{
          background: "oklch(0.72 0.08 200)",
          color: "white",
        }}
      >
        {submitMutation.isPending ? "Enviant..." : "Enviar ressenya"}
      </Button>
    </form>
  );
}
