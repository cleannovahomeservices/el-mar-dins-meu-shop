import { ENV } from "./env";

export type EmailPayload = {
  to: string;
  subject: string;
  html: string;
  text: string;
  replyTo?: string;
};

/**
 * Sends an email to a partner (pickup point, etc.)
 * Uses the Manus built-in email service via the Forge API
 */
export async function sendEmail(payload: EmailPayload): Promise<boolean> {
  const { to, subject, html, text, replyTo } = payload;

  // Validate inputs
  if (!to || !to.includes("@")) {
    console.warn("[Email] Invalid email address:", to);
    return false;
  }

  if (!subject || !html || !text) {
    console.warn("[Email] Missing required email fields");
    return false;
  }

  if (!ENV.forgeApiUrl || !ENV.forgeApiKey) {
    console.warn("[Email] Email service not configured");
    return false;
  }

  try {
    // Use the Manus Forge API to send email
    const endpoint = new URL("webdevtoken.v1.WebDevService/SendEmail", ENV.forgeApiUrl).toString();

    const response = await fetch(endpoint, {
      method: "POST",
      headers: {
        accept: "application/json",
        authorization: `Bearer ${ENV.forgeApiKey}`,
        "content-type": "application/json",
        "connect-protocol-version": "1",
      },
      body: JSON.stringify({
        to,
        subject,
        html,
        text,
        replyTo: replyTo || "info@elmardinsmeu.cat",
      }),
    });

    if (!response.ok) {
      const detail = await response.text().catch(() => "");
      console.warn(
        `[Email] Failed to send email to ${to} (${response.status} ${response.statusText})${
          detail ? `: ${detail}` : ""
        }`
      );
      return false;
    }

    console.log(`[Email] Successfully sent email to ${to}`);
    return true;
  } catch (error) {
    console.warn("[Email] Error sending email:", error);
    return false;
  }
}

/**
 * Sends a welcome email to a new pickup point partner
 */
export async function sendWelcomeEmailToPickupPoint(
  email: string,
  entityName: string,
  contactPerson: string
): Promise<boolean> {
  const { getWelcomeEmailForPickupPoint } = await import("./emailTemplates");
  const { subject, html, text } = getWelcomeEmailForPickupPoint(entityName, contactPerson);

  return sendEmail({
    to: email,
    subject,
    html,
    text,
    replyTo: "info@elmardinsmeu.cat",
  });
}
