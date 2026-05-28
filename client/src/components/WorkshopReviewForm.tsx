import { useState } from "react";
import { Button } from "@/components/ui/button";
import { trpc } from "@/lib/trpc";
import { Star } from "lucide-react";
import { toast } from "sonner";
import { ThankYouAnimation } from "./ThankYouAnimation";

const FIELD_LABELS: Record<string, string> = {
  authorName: "El nom",
  email: "L'email",
  eventType: "El tipus d'event",
  eventTitle: "El títol",
  rating: "La valoració",
  content: "La teva opinió",
};

function formatZodIssue(issue: { code?: string; path?: (string | number)[]; minimum?: number; maximum?: number; message?: string }): string {
  const fieldKey = Array.isArray(issue.path) && issue.path.length > 0 ? String(issue.path[0]) : "";
  const label = FIELD_LABELS[fieldKey] || "El camp";
  switch (issue.code) {
    case "too_small":
      return `${label} ha de tenir almenys ${issue.minimum} caràcters.`;
    case "too_big":
      return `${label} és massa llarga (màxim ${issue.maximum} caràcters).`;
    case "invalid_type":
      return `${label} és obligatori.`;
    case "invalid_format":
    case "invalid_string":
      if (fieldKey === "email") return "L'email no és vàlid.";
      return `${label} no té un format vàlid.`;
    default:
      return issue.message || `Revisa ${label.toLowerCase()}.`;
  }
}

function humanizeError(error: unknown): string {
  if (!(error instanceof Error)) return "No s'ha pogut enviar la ressenya.";
  const msg = error.message || "";
  // Els errors zod arriben com a JSON-string amb un array d'issues
  if (msg.trim().startsWith("[")) {
    try {
      const issues = JSON.parse(msg) as Array<{ code?: string; path?: (string | number)[]; minimum?: number; maximum?: number; message?: string }>;
      if (Array.isArray(issues) && issues.length > 0) {
        return formatZodIssue(issues[0]);
      }
    } catch {
      // ignora i cau al return general
    }
  }
  return msg || "No s'ha pogut enviar la ressenya.";
}

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
  const [fieldErrors, setFieldErrors] = useState<{ authorName?: string; content?: string }>({});
  const submitMutation = trpc.workshopReviews.submit.useMutation();

  const validate = () => {
    const errors: { authorName?: string; content?: string } = {};
    if (formData.authorName.trim().length < 2) {
      errors.authorName = "El nom ha de tenir almenys 2 caràcters.";
    }
    if (formData.content.trim().length < 10) {
      errors.content = "La teva opinió ha de tenir almenys 10 caràcters.";
    }
    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) {
      toast.error("Revisa els camps marcats abans d'enviar.");
      return;
    }
    try {
      await submitMutation.mutateAsync({
        authorName: formData.authorName.trim(),
        email: formData.email.trim() || undefined,
        eventType: formData.eventType,
        eventTitle: formData.eventTitle.trim() || undefined,
        rating: formData.rating,
        content: formData.content.trim(),
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
      setFieldErrors({});
      setTimeout(() => setSubmitted(false), 5000);
    } catch (error) {
      console.error("Error submitting review:", error);
      toast.error(humanizeError(error));
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

  const inputBorder = (hasError?: boolean) =>
    `w-full px-4 py-2 rounded-lg border outline-none transition-colors ${
      hasError ? "border-red-400 focus:border-red-500" : "focus:border-[oklch(0.72_0.08_200)]"
    }`;

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
          onChange={(e) => {
            setFormData({ ...formData, authorName: e.target.value });
            if (fieldErrors.authorName) setFieldErrors({ ...fieldErrors, authorName: undefined });
          }}
          className={inputBorder(!!fieldErrors.authorName)}
          placeholder="Nom complet"
        />
        {fieldErrors.authorName && (
          <p className="text-xs mt-1 font-semibold" style={{ color: "oklch(0.55 0.18 25)" }}>
            {fieldErrors.authorName}
          </p>
        )}
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
            className={inputBorder()}
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
          onChange={(e) => {
            setFormData({ ...formData, content: e.target.value });
            if (fieldErrors.content) setFieldErrors({ ...fieldErrors, content: undefined });
          }}
          className={inputBorder(!!fieldErrors.content)}
          rows={4}
          placeholder="Comparteix la teva experiència..."
          maxLength={2000}
        />
        <div className="flex items-center justify-between mt-1">
          {fieldErrors.content ? (
            <p className="text-xs font-semibold" style={{ color: "oklch(0.55 0.18 25)" }}>
              {fieldErrors.content}
            </p>
          ) : (
            <p className="text-xs" style={{ color: "oklch(0.55 0.04 55)" }}>
              Mínim 10 caràcters
            </p>
          )}
          <p className="text-xs" style={{ color: "oklch(0.55 0.04 55)" }}>
            {formData.content.length}/2000
          </p>
        </div>
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
