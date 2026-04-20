import { useEffect, useState } from "react";
import { Heart, Instagram } from "lucide-react";
import { shareToInstagram } from "@/lib/shareToInstagram";

interface Confetti {
  id: number;
  left: number;
  delay: number;
  duration: number;
}

interface ThankYouAnimationProps {
  authorName?: string;
  rating?: number;
  eventType?: "taller" | "xerrada" | "presentacio" | "altra";
  content?: string;
}

export function ThankYouAnimation({
  authorName = "Anònim",
  rating = 5,
  eventType = "taller",
  content = "Ha estat una experiència increïble!",
}: ThankYouAnimationProps) {
  const [confetti, setConfetti] = useState<Confetti[]>([]);

  useEffect(() => {
    // Generar 15 partícules de confeti
    const confettiPieces = Array.from({ length: 15 }, (_, i) => ({
      id: i,
      left: Math.random() * 100,
      delay: Math.random() * 0.2,
      duration: 2 + Math.random() * 1,
    }));
    setConfetti(confettiPieces);

    // Desaparèixer després de 4 segons
    const timer = setTimeout(() => {
      setConfetti([]);
    }, 4000);

    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="fixed inset-0 flex items-center justify-center z-50 pointer-events-none">
      {/* Fons semitransparent */}
      <div
        className="absolute inset-0 bg-black/20 animate-in fade-in duration-300"
        style={{
          animation: "fadeIn 0.3s ease-out",
        }}
      />

      {/* Modal */}
      <div
        className="relative bg-white rounded-3xl p-8 shadow-2xl text-center max-w-sm mx-4 animate-in scale-in duration-300"
        style={{
          animation: "scaleIn 0.4s cubic-bezier(0.34, 1.56, 0.64, 1)",
        }}
      >
        {/* Icona de cor que creix */}
        <div className="flex justify-center mb-6">
          <div
            style={{
              animation: "heartBeat 0.6s ease-out",
            }}
          >
            <Heart
              size={64}
              fill="currentColor"
              style={{ color: "oklch(0.72 0.08 200)" }}
            />
          </div>
        </div>

        {/* Text principal */}
        <h2
          className="text-2xl font-black mb-2"
          style={{
            fontFamily: "'Playfair Display', serif",
            color: "oklch(0.3 0.06 50)",
          }}
        >
          Gràcies per compartir
        </h2>

        {/* Subtítol */}
        <p
          className="text-sm mb-4"
          style={{
            color: "oklch(0.5 0.05 55)",
            fontFamily: "'Nunito', sans-serif",
          }}
        >
          La teva opinió ens ajuda a créixer i a fer més visible aquesta causa
        </p>

        {/* Decoració */}
        <div className="flex justify-center gap-1 mb-6">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="w-2 h-2 rounded-full"
              style={{
                background: "oklch(0.72 0.08 200)",
                animation: `pulse 1.5s ease-in-out ${i * 0.2}s infinite`,
              }}
            />
          ))}
        </div>

        {/* Botó de compartir a Instagram */}
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
          className="inline-flex items-center gap-2 px-4 py-2 rounded-lg font-semibold transition-all hover:scale-105"
          style={{
            background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
            color: "white",
          }}
        >
          <Instagram size={18} />
          Compartir
        </button>
      </div>

      {/* Confeti */}
      {confetti.map((piece) => (
        <div
          key={piece.id}
          className="absolute w-2 h-2 rounded-full pointer-events-none"
          style={{
            left: `${piece.left}%`,
            top: "-10px",
            background:
              piece.id % 3 === 0
                ? "oklch(0.72 0.08 200)"
                : piece.id % 3 === 1
                  ? "oklch(0.88 0.06 75)"
                  : "oklch(0.65 0.1 50)",
            animation: `fall ${piece.duration}s linear ${piece.delay}s forwards`,
          }}
        />
      ))}

      {/* Estilos d'animació */}
      <style>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }

        @keyframes scaleIn {
          from {
            opacity: 0;
            transform: scale(0.8);
          }
          to {
            opacity: 1;
            transform: scale(1);
          }
        }

        @keyframes heartBeat {
          0% {
            transform: scale(0.8);
            opacity: 0;
          }
          50% {
            transform: scale(1.1);
          }
          100% {
            transform: scale(1);
            opacity: 1;
          }
        }

        @keyframes fall {
          to {
            transform: translateY(100vh) rotate(360deg);
            opacity: 0;
          }
        }

        @keyframes pulse {
          0%, 100% {
            opacity: 0.5;
          }
          50% {
            opacity: 1;
          }
        }
      `}</style>
    </div>
  );
}
