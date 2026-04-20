/**
 * Generate Instagram share URL and text
 * Instagram doesn't support direct sharing via URL, so we provide a formatted text
 * that users can copy and paste, or open Instagram with pre-filled text
 */

interface ShareOptions {
  authorName: string;
  rating: number;
  eventType: string;
  content: string;
  includeUrl?: boolean;
}

export function generateInstagramShareText(options: ShareOptions): string {
  const { authorName, rating, eventType, content, includeUrl = true } = options;

  // Limitar el contingut a 150 caràcters per mantenir-lo concís
  const truncatedContent = content.length > 150 ? content.substring(0, 147) + "..." : content;

  // Generar el text amb emojis de stars
  const stars = "⭐".repeat(rating);
  const eventTypeLabel = {
    taller: "🎓 Taller",
    xerrada: "🎤 Xerrada",
    presentacio: "📊 Presentació",
    altra: "✨ Activitat",
  }[eventType] || "✨ Activitat";

  let shareText = `He participat en una ${eventTypeLabel} de #ElMarDinsMeu i ha estat increïble! ${stars}\n\n"${truncatedContent}"\n\n💙 Trencar el silenci és la nostra responsabilitat.`;

  if (includeUrl) {
    shareText += `\n\nVisita'ns: elmardinsmeu.cat`;
  }

  return shareText;
}

/**
 * Open Instagram share dialog
 * Since Instagram doesn't support direct URL sharing, we copy the text to clipboard
 * and open Instagram, or provide a direct link for mobile users
 */
export function shareToInstagram(options: ShareOptions): void {
  const shareText = generateInstagramShareText(options);

  // Detectar si és mobile
  const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);

  if (isMobile) {
    // En mobile, obrir Instagram amb el text a la clipboard
    navigator.clipboard.writeText(shareText).then(() => {
      // Obrir Instagram
      window.open("https://www.instagram.com/", "_blank");

      // Mostrar notificació
      alert("✅ Text copiat! Enganxa-ho a Instagram Stories o Feed.");
    });
  } else {
    // En desktop, copiar al clipboard i obrir Instagram
    navigator.clipboard.writeText(shareText).then(() => {
      window.open("https://www.instagram.com/", "_blank");

      // Mostrar notificació
      alert("✅ Text copiat! Enganxa-ho a Instagram Stories o Feed.");
    });
  }
}

/**
 * Generar URL per a Instagram Stories (si l'usuari té Instagram instal·lat)
 */
export function getInstagramStoriesUrl(options: ShareOptions): string {
  const shareText = generateInstagramShareText(options);
  const encodedText = encodeURIComponent(shareText);

  // Instagram Stories URL scheme (funciona en dispositius amb Instagram instal·lat)
  return `instagram://story-camera?text=${encodedText}`;
}
