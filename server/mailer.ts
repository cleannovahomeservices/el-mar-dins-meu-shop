/**
 * mailer.ts — El Mar dins Meu
 * Mòdul per enviar correus electrònics de comandes via SMTP (Gmail).
 * Utilitza les credencials configurades a les variables d'entorn.
 */

import nodemailer from "nodemailer";
import { ENV } from "./_core/env";

// Tipus per a les dades d'una comanda
export type OrderEmailData = {
  name: string;
  phone: string;
  email?: string;
  notes?: string;
  paymentMethod: "transferencia" | "enmà" | "stripe";
  items: Array<{
    name: string;
    size: string;
    quantity: number;
    price: number;
  }>;
  totalPrice: number;
};

/**
 * Crea el transporter de nodemailer.
 * Suporta Gmail amb App Password o qualsevol SMTP configurat.
 */
function createTransporter() {
  const smtpUser = process.env.SMTP_USER;
  const smtpPass = process.env.SMTP_PASS;

  if (!smtpUser || !smtpPass) {
    return null;
  }

  return nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: smtpUser,
      pass: smtpPass,
    },
  });
}

/**
 * Genera el cos HTML del correu de comanda.
 */
function buildOrderEmailHtml(data: OrderEmailData): string {
  const paymentLabels: Record<string, string> = {
    transferencia: "🏦 Transferència bancària",
    "enmà": "🤝 Pagament en mà",
  };

  const itemsRows = data.items
    .map(
      (item) => `
      <tr>
        <td style="padding:8px 12px;border-bottom:1px solid #e8dfd0;">${item.name}</td>
        <td style="padding:8px 12px;border-bottom:1px solid #e8dfd0;text-align:center;">${item.size}</td>
        <td style="padding:8px 12px;border-bottom:1px solid #e8dfd0;text-align:center;">${item.quantity}</td>
        <td style="padding:8px 12px;border-bottom:1px solid #e8dfd0;text-align:right;font-weight:bold;">${(item.price * item.quantity).toFixed(0)}€</td>
      </tr>`
    )
    .join("");

  return `
<!DOCTYPE html>
<html lang="ca">
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:#f5f0e8;font-family:'Helvetica Neue',Arial,sans-serif;">
  <div style="max-width:600px;margin:32px auto;background:#fff;border-radius:16px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,0.08);">
    
    <!-- Capçalera -->
    <div style="background:#2a9d8f;padding:32px 40px;text-align:center;">
      <h1 style="color:#fff;margin:0;font-size:24px;font-family:Georgia,serif;">🌊 El Mar dins Meu</h1>
      <p style="color:rgba(255,255,255,0.85);margin:8px 0 0;font-size:14px;">Nova comanda rebuda</p>
    </div>

    <!-- Dades del client -->
    <div style="padding:32px 40px;">
      <h2 style="color:#2a9d8f;font-size:18px;margin:0 0 16px;font-family:Georgia,serif;">Dades del client</h2>
      <table style="width:100%;border-collapse:collapse;">
        <tr>
          <td style="padding:6px 0;color:#666;font-size:14px;width:120px;">👤 Nom</td>
          <td style="padding:6px 0;font-weight:bold;font-size:14px;color:#333;">${data.name}</td>
        </tr>
        <tr>
          <td style="padding:6px 0;color:#666;font-size:14px;">📱 Telèfon</td>
          <td style="padding:6px 0;font-weight:bold;font-size:14px;color:#333;">${data.phone}</td>
        </tr>
        ${
          data.email
            ? `<tr>
          <td style="padding:6px 0;color:#666;font-size:14px;">📧 Email</td>
          <td style="padding:6px 0;font-weight:bold;font-size:14px;color:#333;">${data.email}</td>
        </tr>`
            : ""
        }
        <tr>
          <td style="padding:6px 0;color:#666;font-size:14px;">💳 Pagament</td>
          <td style="padding:6px 0;font-weight:bold;font-size:14px;color:#333;">${paymentLabels[data.paymentMethod]}</td>
        </tr>
        ${
          data.notes
            ? `<tr>
          <td style="padding:6px 0;color:#666;font-size:14px;vertical-align:top;">📝 Notes</td>
          <td style="padding:6px 0;font-size:14px;color:#333;">${data.notes}</td>
        </tr>`
            : ""
        }
      </table>
    </div>

    <!-- Productes -->
    <div style="padding:0 40px 32px;">
      <h2 style="color:#2a9d8f;font-size:18px;margin:0 0 16px;font-family:Georgia,serif;">🛍️ Productes</h2>
      <table style="width:100%;border-collapse:collapse;background:#faf7f2;border-radius:8px;overflow:hidden;">
        <thead>
          <tr style="background:#e8dfd0;">
            <th style="padding:10px 12px;text-align:left;font-size:13px;color:#555;">Producte</th>
            <th style="padding:10px 12px;text-align:center;font-size:13px;color:#555;">Talla</th>
            <th style="padding:10px 12px;text-align:center;font-size:13px;color:#555;">Unitats</th>
            <th style="padding:10px 12px;text-align:right;font-size:13px;color:#555;">Subtotal</th>
          </tr>
        </thead>
        <tbody>
          ${itemsRows}
        </tbody>
        <tfoot>
          <tr style="background:#2a9d8f;">
            <td colspan="3" style="padding:12px;color:#fff;font-weight:bold;font-size:15px;">TOTAL</td>
            <td style="padding:12px;color:#fff;font-weight:bold;font-size:18px;text-align:right;">${data.totalPrice.toFixed(0)}€</td>
          </tr>
        </tfoot>
      </table>
    </div>

    <!-- Nota preventa -->
    <div style="margin:0 40px 32px;padding:16px;background:#fff8e1;border-radius:8px;border-left:4px solid #f4a261;">
      <p style="margin:0;font-size:13px;color:#7a5c2e;">⏳ <strong>Preventa</strong> — Recollida a partir de Maig 2026</p>
      ${
        data.paymentMethod === "transferencia"
          ? `<p style="margin:8px 0 0;font-size:13px;color:#7a5c2e;">💡 <strong>Dades bancàries per al cobrament:</strong></p>
           <p style="margin:6px 0 0;font-size:14px;font-family:monospace;background:#fff3cd;padding:8px 12px;border-radius:6px;color:#5c4a00;letter-spacing:1px;">IBAN: ES98 2100 0033 1302 0185 1489</p>
           <p style="margin:6px 0 0;font-size:12px;color:#7a5c2e;">Recorda enviar l'IBAN al client per completar el pagament.</p>`
          : ""
      }
    </div>

    <!-- Peu de pàgina -->
    <div style="background:#f5f0e8;padding:20px 40px;text-align:center;">
      <p style="margin:0;font-size:12px;color:#999;">El Mar dins Meu · elmardinsmeu@gmail.com</p>
    </div>
  </div>
</body>
</html>`;
}

/**
 * Genera el cos HTML del correu de confirmació per al client.
 */
function buildClientConfirmationHtml(data: OrderEmailData): string {
  const paymentLabels: Record<string, string> = {
    transferencia: "🏦 Transferència bancària",
    "enmà": "🤝 Pagament en mà",
  };

  const itemsRows = data.items
    .map(
      (item) => `
      <tr>
        <td style="padding:8px 12px;border-bottom:1px solid #e8dfd0;">${item.name}</td>
        <td style="padding:8px 12px;border-bottom:1px solid #e8dfd0;text-align:center;">${item.size}</td>
        <td style="padding:8px 12px;border-bottom:1px solid #e8dfd0;text-align:center;">${item.quantity}</td>
        <td style="padding:8px 12px;border-bottom:1px solid #e8dfd0;text-align:right;font-weight:bold;">${(item.price * item.quantity).toFixed(0)}€</td>
      </tr>`
    )
    .join("");

  return `
<!DOCTYPE html>
<html lang="ca">
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:#f5f0e8;font-family:'Helvetica Neue',Arial,sans-serif;">
  <div style="max-width:600px;margin:32px auto;background:#fff;border-radius:16px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,0.08);">
    
    <!-- Capçalera -->
    <div style="background:#2a9d8f;padding:32px 40px;text-align:center;">
      <h1 style="color:#fff;margin:0;font-size:24px;font-family:Georgia,serif;">🌊 El Mar dins Meu</h1>
      <p style="color:rgba(255,255,255,0.85);margin:8px 0 0;font-size:14px;">Confirmació de la teva comanda</p>
    </div>

    <!-- Salutació -->
    <div style="padding:32px 40px 0;">
      <h2 style="color:#2a9d8f;font-size:20px;margin:0 0 12px;font-family:Georgia,serif;">Gràcies, ${data.name}! 🎉</h2>
      <p style="color:#555;font-size:15px;margin:0 0 8px;">Hem rebut la teva comanda correctament. Ens posarem en contacte amb tu ben aviat per confirmar els detalls.</p>
    </div>

    <!-- Resum de la comanda -->
    <div style="padding:24px 40px;">
      <h3 style="color:#2a9d8f;font-size:16px;margin:0 0 12px;font-family:Georgia,serif;">🛍️ Resum de la teva comanda</h3>
      <table style="width:100%;border-collapse:collapse;background:#faf7f2;border-radius:8px;overflow:hidden;">
        <thead>
          <tr style="background:#e8dfd0;">
            <th style="padding:10px 12px;text-align:left;font-size:13px;color:#555;">Producte</th>
            <th style="padding:10px 12px;text-align:center;font-size:13px;color:#555;">Talla</th>
            <th style="padding:10px 12px;text-align:center;font-size:13px;color:#555;">Unitats</th>
            <th style="padding:10px 12px;text-align:right;font-size:13px;color:#555;">Subtotal</th>
          </tr>
        </thead>
        <tbody>
          ${itemsRows}
        </tbody>
        <tfoot>
          <tr style="background:#2a9d8f;">
            <td colspan="3" style="padding:12px;color:#fff;font-weight:bold;font-size:15px;">TOTAL</td>
            <td style="padding:12px;color:#fff;font-weight:bold;font-size:18px;text-align:right;">${data.totalPrice.toFixed(0)}€</td>
          </tr>
        </tfoot>
      </table>
    </div>

    <!-- Forma de pagament -->
    <div style="padding:0 40px 24px;">
      <p style="color:#555;font-size:14px;margin:0;">💳 <strong>Forma de pagament:</strong> ${paymentLabels[data.paymentMethod]}</p>
    </div>

    ${
      data.paymentMethod === "transferencia"
        ? `<!-- Dades bancàries IBAN -->
    <div style="margin:0 40px 24px;padding:20px;background:#e8f8f5;border-radius:10px;border:2px solid #2a9d8f;">
      <h3 style="color:#2a9d8f;font-size:16px;margin:0 0 12px;font-family:Georgia,serif;">🏦 Dades per a la transferència</h3>
      <p style="color:#555;font-size:14px;margin:0 0 8px;">Per completar la teva comanda, realitza la transferència bancària a:</p>
      <div style="background:#fff;border-radius:8px;padding:14px 16px;margin:10px 0;">
        <p style="margin:0 0 6px;font-size:13px;color:#888;">Beneficiari</p>
        <p style="margin:0 0 14px;font-weight:bold;font-size:15px;color:#333;">El Mar dins Meu</p>
        <p style="margin:0 0 6px;font-size:13px;color:#888;">IBAN</p>
        <p style="margin:0;font-family:monospace;font-size:16px;font-weight:bold;color:#2a9d8f;letter-spacing:2px;">ES98 2100 0033 1302 0185 1489</p>
      </div>
      <p style="color:#666;font-size:13px;margin:8px 0 0;">📝 Indica el teu nom i telèfon al concepte de la transferència.</p>
      <p style="color:#666;font-size:13px;margin:6px 0 0;">Un cop realitzada, envia'ns el comprovant a <a href="mailto:elmardinsmeu@gmail.com" style="color:#2a9d8f;">elmardinsmeu@gmail.com</a></p>
    </div>`
        : ""
    }

    <!-- Nota preventa -->
    <div style="margin:0 40px 32px;padding:16px;background:#fff8e1;border-radius:8px;border-left:4px solid #f4a261;">
      <p style="margin:0;font-size:13px;color:#7a5c2e;">⏳ <strong>Preventa</strong> — Recollida a partir de Maig 2026</p>
      <p style="margin:6px 0 0;font-size:13px;color:#7a5c2e;">Et contactarem per confirmar la data i el lloc de recollida.</p>
    </div>

    <!-- Peu de pàgina -->
    <div style="background:#f5f0e8;padding:20px 40px;text-align:center;">
      <p style="margin:0 0 4px;font-size:13px;color:#888;">Gràcies per formar part del projecte El Mar dins Meu 💙</p>
      <p style="margin:0;font-size:12px;color:#aaa;">elmardinsmeu@gmail.com · @elmardinsmeu</p>
    </div>
  </div>
</body>
</html>`;
}

/**
 * Envia un correu de confirmació al client.
 * Només s'envia si el client ha proporcionat una adreça de correu.
 * Retorna true si s'ha enviat correctament, false si ha fallat o no hi ha email.
 */
export async function sendClientConfirmationEmail(data: OrderEmailData): Promise<boolean> {
  if (!data.email) {
    // Email és ara obligatori, però mantenim la comprovació per seguretat
    console.warn("[Mailer] Client sense email — no s'envia confirmació al client.");
    return false;
  }

  const transporter = createTransporter();

  if (!transporter) {
    console.warn("[Mailer] SMTP no configurat — no s'enviarà confirmació al client.");
    return false;
  }

  const senderEmail = process.env.SMTP_USER || "elmardinsmeu@gmail.com";

  try {
    await transporter.sendMail({
      from: `"El Mar dins Meu" <${senderEmail}>`,
      to: data.email,
      replyTo: senderEmail,
      subject: `✅ Confirmació de la teva comanda — El Mar dins Meu`,
      html: buildClientConfirmationHtml(data),
      text:
        `Gràcies, ${data.name}! Hem rebut la teva comanda.\n\n` +
        `Productes:\n` +
        data.items.map((i) => `  • ${i.name} (${i.size}) x${i.quantity} = ${(i.price * i.quantity).toFixed(0)}€`).join("\n") +
        `\n\nTOTAL: ${data.totalPrice.toFixed(0)}€\n` +
        `Forma de pagament: ${data.paymentMethod}\n` +
        (data.paymentMethod === "transferencia"
          ? `\n🏦 Dades per a la transferència:\nBeneficiari: El Mar dins Meu\nIBAN: ES98 2100 0033 1302 0185 1489\n\nIndica el teu nom i telèfon al concepte.\nEnvia el comprovant a elmardinsmeu@gmail.com\n`
          : "") +
        `\n⏳ Preventa — Recollida a partir de Maig 2026\nEt contactarem per confirmar la data i el lloc de recollida.`,
    });

    console.log(`[Mailer] Confirmació enviada al client: ${data.email}`);
    return true;
  } catch (error) {
    console.error("[Mailer] Error enviant confirmació al client:", error);
    return false;
  }
}

/**
 * Envia un correu electrònic amb els detalls d'una nova comanda.
 * Retorna true si s'ha enviat correctament, false si ha fallat.
 */
export async function sendOrderEmail(data: OrderEmailData): Promise<boolean> {
  const transporter = createTransporter();

  if (!transporter) {
    console.warn("[Mailer] SMTP no configurat — no s'enviarà correu. Configura SMTP_USER i SMTP_PASS.");
    return false;
  }

  const recipientEmail = process.env.ORDER_RECIPIENT_EMAIL || "elmardinsmeu@gmail.com";

  try {
    await transporter.sendMail({
      from: `"El Mar dins Meu — Botiga" <${process.env.SMTP_USER}>`,
      to: recipientEmail,
      replyTo: data.email || recipientEmail,
      subject: `🌊 Nova comanda de ${data.name} — ${data.totalPrice.toFixed(0)}€`,
      html: buildOrderEmailHtml(data),
      text:
        `NOVA COMANDA — El Mar dins Meu\n\n` +
        `Nom: ${data.name}\n` +
        `Telèfon: ${data.phone}\n` +
        `Email: ${data.email ?? "No indicat"}\n` +
        `Pagament: ${data.paymentMethod}\n\n` +
        `Productes:\n` +
        data.items.map((i) => `  • ${i.name} (${i.size}) x${i.quantity} = ${(i.price * i.quantity).toFixed(0)}€`).join("\n") +
        `\n\nTOTAL: ${data.totalPrice.toFixed(0)}€` +
        (data.notes ? `\n\nNotes: ${data.notes}` : "") +
        `\n\n⏳ Preventa — Recollida a partir de Maig 2026` +
        (data.paymentMethod === "transferencia"
          ? `\n\n💡 Dades bancàries per al cobrament:\nIBAN: ES98 2100 0033 1302 0185 1489\nRecorda enviar l'IBAN al client per completar el pagament.`
          : ""),
    });

    console.log(`[Mailer] Comanda enviada a ${recipientEmail}`);
    return true;
  } catch (error) {
    console.error("[Mailer] Error enviant correu:", error);
    return false;
  }
}

// Tipus per a les dades del correu d'entrega
export type DeliveryEmailData = {
  customerName: string;
  customerEmail: string;
  totalPrice: number;
  paymentMethod: "transferencia" | "enmà" | "stripe";
  items: Array<{
    name: string;
    size: string;
    quantity: number;
    price: number;
  }>;
};

/**
 * Genera el cos HTML del correu d'entrega per al client.
 */
function buildDeliveryEmailHtml(data: DeliveryEmailData): string {
  const itemsRows = data.items
    .map(
      (item) => `
      <tr>
        <td style="padding:8px 12px;border-bottom:1px solid #e8dfd0;">${item.name}</td>
        <td style="padding:8px 12px;border-bottom:1px solid #e8dfd0;text-align:center;">${item.size}</td>
        <td style="padding:8px 12px;border-bottom:1px solid #e8dfd0;text-align:center;">${item.quantity}</td>
        <td style="padding:8px 12px;border-bottom:1px solid #e8dfd0;text-align:right;font-weight:bold;">${(item.price * item.quantity).toFixed(0)}€</td>
      </tr>`
    )
    .join("");

  const paymentNote =
    data.paymentMethod === "transferencia"
      ? `<div style="margin:0 40px 24px;padding:16px;background:#fff8e1;border-radius:8px;border-left:4px solid #f4a261;">
          <p style="margin:0;font-size:13px;color:#7a5c2e;">💳 Si encara no has realitzat la transferència, recorda fer-la a:</p>
          <p style="margin:8px 0 0;font-family:monospace;font-size:15px;font-weight:bold;color:#2a9d8f;letter-spacing:1px;">IBAN: ES98 2100 0033 1302 0185 1489</p>
          <p style="margin:6px 0 0;font-size:12px;color:#7a5c2e;">Beneficiari: El Mar dins Meu · Indica el teu nom al concepte.</p>
        </div>`
      : "";

  return `
<!DOCTYPE html>
<html lang="ca">
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:#f5f0e8;font-family:'Helvetica Neue',Arial,sans-serif;">
  <div style="max-width:600px;margin:32px auto;background:#fff;border-radius:16px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,0.08);">

    <!-- Capçalera -->
    <div style="background:#2a9d8f;padding:32px 40px;text-align:center;">
      <h1 style="color:#fff;margin:0;font-size:24px;font-family:Georgia,serif;">🌊 El Mar dins Meu</h1>
      <p style="color:rgba(255,255,255,0.85);margin:8px 0 0;font-size:14px;">La teva comanda és a punt!</p>
    </div>

    <!-- Missatge principal -->
    <div style="padding:36px 40px 24px;">
      <div style="text-align:center;margin-bottom:24px;">
        <div style="display:inline-block;background:#e8f8f5;border-radius:50%;width:72px;height:72px;line-height:72px;font-size:36px;text-align:center;">📦</div>
      </div>
      <h2 style="color:#2a9d8f;font-size:22px;margin:0 0 12px;font-family:Georgia,serif;text-align:center;">
        La teva comanda està llesta, ${data.customerName}!
      </h2>
      <p style="color:#555;font-size:15px;margin:0 0 8px;text-align:center;line-height:1.6;">
        Hem preparat la teva comanda i ja pots recollir-la.<br>
        Ens posarem en contacte amb tu per confirmar el lloc i l'hora de recollida.
      </p>
    </div>

    <!-- Resum de la comanda -->
    <div style="padding:0 40px 24px;">
      <h3 style="color:#2a9d8f;font-size:16px;margin:0 0 12px;font-family:Georgia,serif;">🛍️ Resum de la comanda</h3>
      <table style="width:100%;border-collapse:collapse;background:#faf7f2;border-radius:8px;overflow:hidden;">
        <thead>
          <tr style="background:#e8dfd0;">
            <th style="padding:10px 12px;text-align:left;font-size:13px;color:#555;">Producte</th>
            <th style="padding:10px 12px;text-align:center;font-size:13px;color:#555;">Talla</th>
            <th style="padding:10px 12px;text-align:center;font-size:13px;color:#555;">Unitats</th>
            <th style="padding:10px 12px;text-align:right;font-size:13px;color:#555;">Subtotal</th>
          </tr>
        </thead>
        <tbody>
          ${itemsRows}
        </tbody>
        <tfoot>
          <tr style="background:#2a9d8f;">
            <td colspan="3" style="padding:12px;color:#fff;font-weight:bold;font-size:15px;">TOTAL</td>
            <td style="padding:12px;color:#fff;font-weight:bold;font-size:18px;text-align:right;">${data.totalPrice.toFixed(0)}€</td>
          </tr>
        </tfoot>
      </table>
    </div>

    ${paymentNote}

    <!-- Missatge de suport al projecte -->
    <div style="margin:0 40px 32px;padding:20px;background:#e8f8f5;border-radius:10px;border:2px solid #2a9d8f;text-align:center;">
      <p style="margin:0 0 8px;font-size:15px;color:#2a9d8f;font-weight:bold;font-family:Georgia,serif;">
        💙 Gràcies per formar part del moviment
      </p>
      <p style="margin:0;font-size:13px;color:#555;line-height:1.6;">
        Amb la teva compra ajudes a fer visible l'invisible i a prevenir l'abús i les violències cap als infants.<br>
        <strong>#ElMardinsMeu</strong>
      </p>
    </div>

    <!-- Peu de pàgina -->
    <div style="background:#f5f0e8;padding:20px 40px;text-align:center;">
      <p style="margin:0 0 4px;font-size:13px;color:#888;">Qualsevol dubte, escriu-nos a <a href="mailto:elmardinsmeu@gmail.com" style="color:#2a9d8f;">elmardinsmeu@gmail.com</a></p>
      <p style="margin:0;font-size:12px;color:#aaa;">El Mar dins Meu · @elmardinsmeu</p>
    </div>
  </div>
</body>
</html>`;
}

/**
 * Envia un correu d'entrega al client quan la seva comanda es marca com a entregada.
 * Retorna true si s'ha enviat correctament, false si ha fallat o no hi ha email.
 */
export async function sendDeliveryEmail(data: DeliveryEmailData): Promise<boolean> {
  if (!data.customerEmail) {
    console.warn("[Mailer] Client sense email — no s'envia correu d'entrega.");
    return false;
  }

  const transporter = createTransporter();

  if (!transporter) {
    console.warn("[Mailer] SMTP no configurat — no s'enviarà correu d'entrega.");
    return false;
  }

  const senderEmail = process.env.SMTP_USER || "elmardinsmeu@gmail.com";

  try {
    await transporter.sendMail({
      from: `"El Mar dins Meu" <${senderEmail}>`,
      to: data.customerEmail,
      replyTo: senderEmail,
      subject: `📦 La teva comanda d'El Mar dins Meu està llesta!`,
      html: buildDeliveryEmailHtml(data),
      text:
        `Hola, ${data.customerName}!\n\n` +
        `La teva comanda d'El Mar dins Meu ja està preparada i llesta per recollir.\n\n` +
        `Resum:\n` +
        data.items.map((i) => `  • ${i.name} (${i.size}) x${i.quantity} = ${(i.price * i.quantity).toFixed(0)}€`).join("\n") +
        `\n\nTOTAL: ${data.totalPrice.toFixed(0)}€\n\n` +
        (data.paymentMethod === "transferencia"
          ? `Si encara no has realitzat la transferència, recorda fer-la a:\nIBAN: ES98 2100 0033 1302 0185 1489\nBeneficiari: El Mar dins Meu\n\n`
          : "") +
        `Ens posarem en contacte amb tu per confirmar el lloc i l'hora de recollida.\n\n` +
        `Gràcies per formar part del moviment #ElMardinsMeu 💙\n` +
        `elmardinsmeu@gmail.com`,
    });

    console.log(`[Mailer] Correu d'entrega enviat a: ${data.customerEmail}`);
    return true;
  } catch (error) {
    console.error("[Mailer] Error enviant correu d'entrega:", error);
    return false;
  }
}

// Tipus per a les dades del correu de recordatori de pagament
export type PaymentReminderEmailData = {
  customerName: string;
  customerEmail: string;
  totalPrice: number;
  items: Array<{
    name: string;
    size: string;
    quantity: number;
    price: number;
  }>;
};

/**
 * Genera el cos HTML del correu de recordatori de pagament.
 */
function buildPaymentReminderEmailHtml(data: PaymentReminderEmailData): string {
  const itemsRows = data.items
    .map(
      (item) => `
      <tr>
        <td style="padding:8px 12px;border-bottom:1px solid #e8dfd0;">${item.name}</td>
        <td style="padding:8px 12px;border-bottom:1px solid #e8dfd0;text-align:center;">${item.size}</td>
        <td style="padding:8px 12px;border-bottom:1px solid #e8dfd0;text-align:center;">${item.quantity}</td>
        <td style="padding:8px 12px;border-bottom:1px solid #e8dfd0;text-align:right;font-weight:bold;">${(item.price * item.quantity).toFixed(0)}€</td>
      </tr>`
    )
    .join("");

  return `<!DOCTYPE html>
<html lang="ca">
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1.0"></head>
<body style="margin:0;padding:0;background:#f5f0e8;font-family:Georgia,serif;">
  <div style="max-width:600px;margin:32px auto;background:#fff;border-radius:16px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,0.08);">

    <!-- Capçalera -->
    <div style="background:#2a9d8f;padding:32px 40px;text-align:center;">
      <h1 style="margin:0;color:#fff;font-size:26px;font-family:Georgia,serif;">El Mar dins Meu</h1>
      <p style="margin:8px 0 0;color:rgba(255,255,255,0.85);font-size:13px;font-family:Arial,sans-serif;">
        Fem visible, l'invisible. Per la sensibilització de les violències.
      </p>
    </div>

    <!-- Cos principal -->
    <div style="padding:32px 40px;">
      <h2 style="margin:0 0 8px;font-size:20px;color:#2a9d8f;font-family:Georgia,serif;">
        💳 Recordatori de pagament
      </h2>
      <p style="margin:0 0 20px;font-size:15px;color:#444;line-height:1.6;font-family:Arial,sans-serif;">
        Hola, <strong>${data.customerName}</strong>!
      </p>
      <p style="margin:0 0 20px;font-size:14px;color:#555;line-height:1.7;font-family:Arial,sans-serif;">
        Et recordem que la teva comanda d'<strong>El Mar dins Meu</strong> ja està preparada i llesta per recollir,
        però encara no hem rebut el pagament per transferència bancària.
      </p>
      <p style="margin:0 0 24px;font-size:14px;color:#555;line-height:1.7;font-family:Arial,sans-serif;">
        Si us plau, realitza la transferència el més aviat possible per confirmar la teva comanda:
      </p>

      <!-- Dades bancàries destacades -->
      <div style="margin:0 0 24px;padding:20px;background:#e8f8f5;border-radius:10px;border:2px solid #2a9d8f;text-align:center;">
        <p style="margin:0 0 6px;font-size:13px;color:#555;font-family:Arial,sans-serif;">Transferència bancària a:</p>
        <p style="margin:0 0 4px;font-family:monospace;font-size:18px;font-weight:bold;color:#2a9d8f;letter-spacing:1px;">
          IBAN: ES98 2100 0033 1302 0185 1489
        </p>
        <p style="margin:6px 0 0;font-size:13px;color:#7a5c2e;font-family:Arial,sans-serif;">
          Beneficiari: <strong>El Mar dins Meu</strong><br>
          Concepte: <strong>${data.customerName} — comanda El Mar dins Meu</strong>
        </p>
      </div>
    </div>

    <!-- Resum de la comanda -->
    <div style="padding:0 40px 32px;">
      <h3 style="margin:0 0 12px;font-size:15px;color:#555;font-family:Arial,sans-serif;text-transform:uppercase;letter-spacing:1px;">
        Resum de la teva comanda
      </h3>
      <table style="width:100%;border-collapse:collapse;font-family:Arial,sans-serif;font-size:14px;">
        <thead>
          <tr style="background:#f5f0e8;">
            <th style="padding:10px 12px;text-align:left;font-size:13px;color:#555;">Producte</th>
            <th style="padding:10px 12px;text-align:center;font-size:13px;color:#555;">Talla</th>
            <th style="padding:10px 12px;text-align:center;font-size:13px;color:#555;">Unitats</th>
            <th style="padding:10px 12px;text-align:right;font-size:13px;color:#555;">Subtotal</th>
          </tr>
        </thead>
        <tbody>
          ${itemsRows}
        </tbody>
        <tfoot>
          <tr style="background:#2a9d8f;">
            <td colspan="3" style="padding:12px;color:#fff;font-weight:bold;font-size:15px;">TOTAL A PAGAR</td>
            <td style="padding:12px;color:#fff;font-weight:bold;font-size:18px;text-align:right;">${data.totalPrice.toFixed(0)}€</td>
          </tr>
        </tfoot>
      </table>
    </div>

    <!-- Nota final -->
    <div style="margin:0 40px 32px;padding:16px;background:#fff8e1;border-radius:8px;border-left:4px solid #f4a261;">
      <p style="margin:0;font-size:13px;color:#7a5c2e;font-family:Arial,sans-serif;line-height:1.6;">
        Si ja has realitzat la transferència, si us plau ignora aquest missatge. En cas de dubte, 
        pots contactar-nos a <a href="mailto:elmardinsmeu@gmail.com" style="color:#2a9d8f;">elmardinsmeu@gmail.com</a>.
      </p>
    </div>

    <!-- Missatge de suport al projecte -->
    <div style="margin:0 40px 32px;padding:20px;background:#e8f8f5;border-radius:10px;border:2px solid #2a9d8f;text-align:center;">
      <p style="margin:0 0 8px;font-size:15px;color:#2a9d8f;font-weight:bold;font-family:Georgia,serif;">
        💙 Gràcies per formar part del moviment
      </p>
      <p style="margin:0;font-size:13px;color:#555;line-height:1.6;font-family:Arial,sans-serif;">
        Amb la teva compra ajudes a fer visible l'invisible i a prevenir l'abús i les violències cap als infants.<br>
        <strong>#ElMardinsMeu</strong>
      </p>
    </div>

    <!-- Peu de pàgina -->
    <div style="background:#f5f0e8;padding:20px 40px;text-align:center;">
      <p style="margin:0 0 4px;font-size:13px;color:#888;font-family:Arial,sans-serif;">Qualsevol dubte, escriu-nos a <a href="mailto:elmardinsmeu@gmail.com" style="color:#2a9d8f;">elmardinsmeu@gmail.com</a></p>
      <p style="margin:0;font-size:12px;color:#aaa;font-family:Arial,sans-serif;">El Mar dins Meu · @elmardinsmeu</p>
    </div>
  </div>
</body>
</html>`;
}

/**
 * Envia un correu de recordatori de pagament al client.
 * Retorna true si s'ha enviat correctament, false si ha fallat o no hi ha email.
 */
export async function sendPaymentReminderEmail(data: PaymentReminderEmailData): Promise<boolean> {
  if (!data.customerEmail) {
    console.warn("[Mailer] Client sense email — no s'envia recordatori de pagament.");
    return false;
  }

  const transporter = createTransporter();

  if (!transporter) {
    console.warn("[Mailer] SMTP no configurat — no s'enviarà recordatori de pagament.");
    return false;
  }

  const senderEmail = process.env.SMTP_USER || "elmardinsmeu@gmail.com";

  try {
    await transporter.sendMail({
      from: `"El Mar dins Meu" <${senderEmail}>`,
      to: data.customerEmail,
      replyTo: senderEmail,
      subject: `💳 Recordatori de pagament — El Mar dins Meu`,
      html: buildPaymentReminderEmailHtml(data),
      text:
        `Hola, ${data.customerName}!\n\n` +
        `Et recordem que la teva comanda d'El Mar dins Meu ja està preparada, però encara no hem rebut el pagament.\n\n` +
        `Si us plau, realitza la transferència a:\n` +
        `IBAN: ES98 2100 0033 1302 0185 1489\n` +
        `Beneficiari: El Mar dins Meu\n` +
        `Concepte: ${data.customerName} — comanda El Mar dins Meu\n\n` +
        `Resum:\n` +
        data.items.map((i) => `  • ${i.name} (${i.size}) x${i.quantity} = ${(i.price * i.quantity).toFixed(0)}€`).join("\n") +
        `\n\nTOTAL A PAGAR: ${data.totalPrice.toFixed(0)}€\n\n` +
        `Si ja has realitzat la transferència, si us plau ignora aquest missatge.\n\n` +
        `Gràcies per formar part del moviment #ElMardinsMeu 💙\n` +
        `elmardinsmeu@gmail.com`,
    });

    console.log(`[Mailer] Recordatori de pagament enviat a: ${data.customerEmail}`);
    return true;
  } catch (error) {
    console.error("[Mailer] Error enviant recordatori de pagament:", error);
    return false;
  }
}

// ── Tipus per al formulari de contacte ──────────────────────
export type ContactEmailData = {
  nom: string;
  email: string;
  motiu: string;
  missatge: string;
};

/**
 * Envia el missatge del formulari de contacte a l'adreça del projecte.
 */
export async function sendContactEmail(data: ContactEmailData): Promise<boolean> {
  const transporter = createTransporter();
  const projectEmail = "elmardinsmeu@gmail.com";

  if (!transporter) {
    console.warn("[Mailer] SMTP no configurat — no s'enviarà el missatge de contacte.");
    return false;
  }

  const senderEmail = process.env.SMTP_USER || "elmardinsmeu@gmail.com";

  try {
    await transporter.sendMail({
      from: `"El Mar dins Meu - Web" <${senderEmail}>`,
      to: projectEmail,
      replyTo: data.email,
      subject: `[El Mar dins Meu] ${data.motiu} — ${data.nom}`,
      html: `
        <div style="font-family: 'Nunito', Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 24px; background: #f9f5f0; border-radius: 16px;">
          <div style="background: oklch(0.72 0.08 200); border-radius: 12px; padding: 20px 24px; margin-bottom: 24px;">
            <h2 style="color: white; margin: 0; font-size: 20px;">📬 Nou missatge de contacte</h2>
            <p style="color: rgba(255,255,255,0.85); margin: 4px 0 0; font-size: 14px;">El Mar dins Meu — Formulari web</p>
          </div>

          <table style="width: 100%; border-collapse: collapse; margin-bottom: 20px;">
            <tr>
              <td style="padding: 10px 14px; background: white; border-radius: 8px 8px 0 0; border-bottom: 1px solid #e8ddd0;">
                <span style="font-size: 12px; color: #888; text-transform: uppercase; letter-spacing: 0.05em;">Nom</span><br>
                <strong style="color: #3a2e1e; font-size: 15px;">${data.nom}</strong>
              </td>
            </tr>
            <tr>
              <td style="padding: 10px 14px; background: white; border-bottom: 1px solid #e8ddd0;">
                <span style="font-size: 12px; color: #888; text-transform: uppercase; letter-spacing: 0.05em;">Correu electrònic</span><br>
                <a href="mailto:${data.email}" style="color: oklch(0.55 0.1 200); font-size: 15px; text-decoration: none;">${data.email}</a>
              </td>
            </tr>
            <tr>
              <td style="padding: 10px 14px; background: white; border-radius: 0 0 8px 8px;">
                <span style="font-size: 12px; color: #888; text-transform: uppercase; letter-spacing: 0.05em;">Motiu</span><br>
                <strong style="color: #3a2e1e; font-size: 15px;">${data.motiu}</strong>
              </td>
            </tr>
          </table>

          <div style="background: white; border-radius: 8px; padding: 16px 20px; margin-bottom: 20px; border-left: 4px solid oklch(0.72 0.08 200);">
            <p style="font-size: 12px; color: #888; text-transform: uppercase; letter-spacing: 0.05em; margin: 0 0 8px;">Missatge</p>
            <p style="color: #3a2e1e; font-size: 15px; line-height: 1.6; margin: 0; white-space: pre-wrap;">${data.missatge}</p>
          </div>

          <p style="font-size: 12px; color: #aaa; text-align: center; margin: 0;">
            Pots respondre directament a aquest correu per contactar amb ${data.nom}.
          </p>
        </div>
      `,
      text:
        `Nou missatge de contacte — El Mar dins Meu\n\n` +
        `Nom: ${data.nom}\n` +
        `Correu: ${data.email}\n` +
        `Motiu: ${data.motiu}\n\n` +
        `Missatge:\n${data.missatge}`,
    });

    console.log(`[Mailer] Missatge de contacte enviat de: ${data.email}`);
    return true;
  } catch (error) {
    console.error("[Mailer] Error enviant missatge de contacte:", error);
    return false;
  }
}

// ── Tipus per al correu de confirmació de pagament ───────────
export type PaymentConfirmationEmailData = {
  customerName: string;
  customerEmail: string;
  totalPrice: number;
  paymentMethod: "transferencia" | "enmà" | "stripe";
  items: Array<{
    name: string;
    size: string;
    quantity: number;
    price: number;
  }>;
};

/**
 * Genera el cos HTML del correu de confirmació de pagament.
 */
function buildPaymentConfirmationEmailHtml(data: PaymentConfirmationEmailData): string {
  const itemsRows = data.items
    .map(
      (item) => `
      <tr>
        <td style="padding:8px 12px;border-bottom:1px solid #e8dfd0;">${item.name}</td>
        <td style="padding:8px 12px;border-bottom:1px solid #e8dfd0;text-align:center;">${item.size}</td>
        <td style="padding:8px 12px;border-bottom:1px solid #e8dfd0;text-align:center;">${item.quantity}</td>
        <td style="padding:8px 12px;border-bottom:1px solid #e8dfd0;text-align:right;font-weight:bold;">${(item.price * item.quantity).toFixed(0)}€</td>
      </tr>`
    )
    .join("");

  return `<!DOCTYPE html>
<html lang="ca">
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1.0"></head>
<body style="margin:0;padding:0;background:#f5f0e8;font-family:'Helvetica Neue',Arial,sans-serif;">
  <div style="max-width:600px;margin:32px auto;background:#fff;border-radius:16px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,0.08);">

    <!-- Capçalera -->
    <div style="background:#2a9d8f;padding:32px 40px;text-align:center;">
      <h1 style="color:#fff;margin:0;font-size:24px;font-family:Georgia,serif;">🌊 El Mar dins Meu</h1>
      <p style="color:rgba(255,255,255,0.85);margin:8px 0 0;font-size:14px;">Pagament confirmat</p>
    </div>

    <!-- Missatge principal -->
    <div style="padding:36px 40px 24px;text-align:center;">
      <div style="display:inline-block;background:#e8f8f5;border-radius:50%;width:72px;height:72px;line-height:72px;font-size:36px;text-align:center;">✅</div>
      <h2 style="color:#2a9d8f;font-size:22px;margin:16px 0 12px;font-family:Georgia,serif;">
        Pagament confirmat, ${data.customerName}!
      </h2>
      <p style="color:#555;font-size:15px;margin:0;line-height:1.6;">
        Hem confirmat el teu pagament de <strong>${data.totalPrice.toFixed(0)}€</strong>.<br>
        La teva comanda ja està reservada i confirmada.
      </p>
    </div>

    <!-- Resum de la comanda -->
    <div style="padding:0 40px 24px;">
      <h3 style="color:#2a9d8f;font-size:16px;margin:0 0 12px;font-family:Georgia,serif;">🛍️ Resum de la comanda</h3>
      <table style="width:100%;border-collapse:collapse;background:#faf7f2;border-radius:8px;overflow:hidden;">
        <thead>
          <tr style="background:#e8dfd0;">
            <th style="padding:10px 12px;text-align:left;font-size:13px;color:#555;">Producte</th>
            <th style="padding:10px 12px;text-align:center;font-size:13px;color:#555;">Talla</th>
            <th style="padding:10px 12px;text-align:center;font-size:13px;color:#555;">Unitats</th>
            <th style="padding:10px 12px;text-align:right;font-size:13px;color:#555;">Subtotal</th>
          </tr>
        </thead>
        <tbody>
          ${itemsRows}
        </tbody>
        <tfoot>
          <tr style="background:#2a9d8f;">
            <td colspan="3" style="padding:12px;color:#fff;font-weight:bold;font-size:15px;">TOTAL PAGAT</td>
            <td style="padding:12px;color:#fff;font-weight:bold;font-size:18px;text-align:right;">${data.totalPrice.toFixed(0)}€</td>
          </tr>
        </tfoot>
      </table>
    </div>

    <!-- Nota preventa -->
    <div style="margin:0 40px 32px;padding:16px;background:#fff8e1;border-radius:8px;border-left:4px solid #f4a261;">
      <p style="margin:0;font-size:13px;color:#7a5c2e;">⏳ <strong>Preventa</strong> — Recollida a partir de Maig 2026</p>
      <p style="margin:6px 0 0;font-size:13px;color:#7a5c2e;">Et contactarem per confirmar la data i el lloc de recollida quan les samarretes estiguin llestes.</p>
    </div>

    <!-- Missatge de suport al projecte -->
    <div style="margin:0 40px 32px;padding:20px;background:#e8f8f5;border-radius:10px;border:2px solid #2a9d8f;text-align:center;">
      <p style="margin:0 0 8px;font-size:15px;color:#2a9d8f;font-weight:bold;font-family:Georgia,serif;">
        💙 Gràcies per formar part del moviment
      </p>
      <p style="margin:0;font-size:13px;color:#555;line-height:1.6;">
        Amb la teva compra ajudes a fer visible l'invisible i a prevenir l'abús i les violències cap als infants.<br>
        <strong>#ElMardinsMeu</strong>
      </p>
    </div>

    <!-- Peu de pàgina -->
    <div style="background:#f5f0e8;padding:20px 40px;text-align:center;">
      <p style="margin:0 0 4px;font-size:13px;color:#888;">Qualsevol dubte, escriu-nos a <a href="mailto:elmardinsmeu@gmail.com" style="color:#2a9d8f;">elmardinsmeu@gmail.com</a></p>
      <p style="margin:0;font-size:12px;color:#aaa;">El Mar dins Meu · @elmardinsmeu</p>
    </div>
  </div>
</body>
</html>`;
}

/**
 * Envia un correu de confirmació de pagament al client quan l'admin marca la comanda com a pagada.
 * Retorna true si s'ha enviat correctament, false si ha fallat o no hi ha email.
 */
export async function sendPaymentConfirmationEmail(data: PaymentConfirmationEmailData): Promise<boolean> {
  if (!data.customerEmail) {
    console.warn("[Mailer] Client sense email — no s'envia confirmació de pagament.");
    return false;
  }

  const transporter = createTransporter();

  if (!transporter) {
    console.warn("[Mailer] SMTP no configurat — no s'enviarà confirmació de pagament.");
    return false;
  }

  const senderEmail = process.env.SMTP_USER || "elmardinsmeu@gmail.com";

  try {
    await transporter.sendMail({
      from: `"El Mar dins Meu" <${senderEmail}>`,
      to: data.customerEmail,
      replyTo: senderEmail,
      subject: `✅ Pagament confirmat — El Mar dins Meu`,
      html: buildPaymentConfirmationEmailHtml(data),
      text:
        `Hola, ${data.customerName}!\n\n` +
        `Hem confirmat el teu pagament de ${data.totalPrice.toFixed(0)}€.\n` +
        `La teva comanda ja està reservada i confirmada.\n\n` +
        `Resum:\n` +
        data.items.map((i) => `  • ${i.name} (${i.size}) x${i.quantity} = ${(i.price * i.quantity).toFixed(0)}€`).join("\n") +
        `\n\nTOTAL PAGAT: ${data.totalPrice.toFixed(0)}€\n\n` +
        `⏳ Preventa — Recollida a partir de Maig 2026\n` +
        `Et contactarem per confirmar la data i el lloc de recollida.\n\n` +
        `Gràcies per formar part del moviment #ElMardinsMeu 💙\n` +
        `elmardinsmeu@gmail.com`,
    });

    console.log(`[Mailer] Confirmació de pagament enviada a: ${data.customerEmail}`);
    return true;
  } catch (error) {
    console.error("[Mailer] Error enviant confirmació de pagament:", error);
    return false;
  }
}


/**
 * Tipus per a les dades d'un correu de comanda llista per recollir
 */
export type OrderReadyEmailData = {
  customerName: string;
  customerEmail: string;
  pickupPointName: string;
  pickupPointAddress: string;
  pickupPointCity: string;
  pickupPointPhone?: string;
  notes?: string;
};

/**
 * Genera el cos HTML del correu de comanda llista per recollir.
 */
function buildOrderReadyEmailHtml(data: OrderReadyEmailData): string {
  return `<!DOCTYPE html>
<html lang="ca">
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1.0"></head>
<body style="margin:0;padding:0;background:#f5f0e8;font-family:'Helvetica Neue',Arial,sans-serif;">
  <div style="max-width:600px;margin:32px auto;background:#fff;border-radius:16px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,0.08);">

    <!-- Capçalera -->
    <div style="background:#2a9d8f;padding:32px 40px;text-align:center;">
      <h1 style="color:#fff;margin:0;font-size:24px;font-family:Georgia,serif;">🌊 El Mar dins Meu</h1>
      <p style="color:rgba(255,255,255,0.85);margin:8px 0 0;font-size:14px;">La teva comanda està llista!</p>
    </div>

    <!-- Missatge principal -->
    <div style="padding:36px 40px 24px;text-align:center;">
      <div style="display:inline-block;background:#e8f8f5;border-radius:50%;width:72px;height:72px;line-height:72px;font-size:36px;text-align:center;">🎉</div>
      <h2 style="color:#2a9d8f;font-size:22px;margin:16px 0 12px;font-family:Georgia,serif;">
        Ja pots recollir la teva comanda!
      </h2>
      <p style="color:#555;font-size:15px;margin:0;line-height:1.6;">
        Bona notícia, ${data.customerName}! La teva comanda ja està llista per recollir.
      </p>
    </div>

    <!-- Dades de recollida -->
    <div style="margin:0 40px 32px;padding:20px;background:#e8f8f5;border-radius:10px;border:2px solid #2a9d8f;">
      <h3 style="color:#2a9d8f;font-size:16px;margin:0 0 16px;font-family:Georgia,serif;">📍 Punt de recollida</h3>
      
      <div style="background:#fff;border-radius:8px;padding:16px;margin-bottom:12px;">
        <p style="margin:0 0 8px;font-size:14px;color:#888;">Establiment</p>
        <p style="margin:0 0 14px;font-weight:bold;font-size:16px;color:#2a9d8f;">${data.pickupPointName}</p>
        
        <p style="margin:0 0 6px;font-size:14px;color:#888;">Adreça</p>
        <p style="margin:0 0 14px;font-size:15px;color:#333;">
          ${data.pickupPointAddress}<br>
          ${data.pickupPointCity}
        </p>
        
        ${
          data.pickupPointPhone
            ? `<p style="margin:0 0 6px;font-size:14px;color:#888;">Telèfon</p>
        <p style="margin:0;font-size:15px;color:#333;"><a href="tel:${data.pickupPointPhone}" style="color:#2a9d8f;text-decoration:none;font-weight:bold;">${data.pickupPointPhone}</a></p>`
            : ""
        }
      </div>

      ${
        data.notes
          ? `<p style="margin:0;font-size:13px;color:#666;font-style:italic;">📝 ${data.notes}</p>`
          : ""
      }
    </div>

    <!-- Instruccions -->
    <div style="margin:0 40px 32px;padding:16px;background:#fff8e1;border-radius:8px;border-left:4px solid #f4a261;">
      <p style="margin:0 0 8px;font-size:14px;color:#7a5c2e;"><strong>⏰ Horaris de recollida:</strong></p>
      <p style="margin:0;font-size:13px;color:#7a5c2e;">Consulta els horaris del punt de recollida i vés quan et vagi bé. Si tens dubtes, no dubtis en contactar-los.</p>
    </div>

    <!-- Missatge de suport al projecte -->
    <div style="margin:0 40px 32px;padding:20px;background:#e8f8f5;border-radius:10px;border:2px solid #2a9d8f;text-align:center;">
      <p style="margin:0 0 8px;font-size:15px;color:#2a9d8f;font-weight:bold;font-family:Georgia,serif;">
        💙 Gràcies per formar part del moviment
      </p>
      <p style="margin:0;font-size:13px;color:#555;line-height:1.6;">
        Amb la teva compra ajudes a fer visible l'invisible i a prevenir l'abús i les violències cap als infants.<br>
        <strong>#ElMardinsMeu</strong>
      </p>
    </div>

    <!-- Peu de pàgina -->
    <div style="background:#f5f0e8;padding:20px 40px;text-align:center;">
      <p style="margin:0 0 4px;font-size:13px;color:#888;">Qualsevol dubte, escriu-nos a <a href="mailto:elmardinsmeu@gmail.com" style="color:#2a9d8f;">elmardinsmeu@gmail.com</a></p>
      <p style="margin:0;font-size:12px;color:#aaa;">El Mar dins Meu · @elmardinsmeu</p>
    </div>
  </div>
</body>
</html>`;
}

/**
 * Envia un correu al client notificant que la comanda està llista per recollir.
 * Retorna true si s'ha enviat correctament, false si ha fallat o no hi ha email.
 */
export async function sendOrderReadyEmail(data: OrderReadyEmailData): Promise<boolean> {
  if (!data.customerEmail) {
    console.warn("[Mailer] Client sense email — no s'envia notificació de comanda llista.");
    return false;
  }

  const transporter = createTransporter();

  if (!transporter) {
    console.warn("[Mailer] SMTP no configurat — no s'enviarà notificació de comanda llista.");
    return false;
  }

  const senderEmail = process.env.SMTP_USER || "elmardinsmeu@gmail.com";

  try {
    await transporter.sendMail({
      from: `"El Mar dins Meu" <${senderEmail}>`,
      to: data.customerEmail,
      replyTo: senderEmail,
      subject: `🎉 La teva comanda està llista! — El Mar dins Meu`,
      html: buildOrderReadyEmailHtml(data),
      text:
        `Hola, ${data.customerName}!\n\n` +
        `Bona notícia! La teva comanda ja està llista per recollir.\n\n` +
        `📍 Punt de recollida:\n` +
        `${data.pickupPointName}\n` +
        `${data.pickupPointAddress}\n` +
        `${data.pickupPointCity}\n` +
        (data.pickupPointPhone ? `Telèfon: ${data.pickupPointPhone}\n` : "") +
        `\n${data.notes ? `Nota: ${data.notes}\n\n` : ""}` +
        `Consulta els horaris de recollida i vés quan et vagi bé.\n\n` +
        `Gràcies per formar part del moviment #ElMardinsMeu 💙\n` +
        `elmardinsmeu@gmail.com`,
    });

    console.log(`[Mailer] Notificació de comanda llista enviada a: ${data.customerEmail}`);
    return true;
  } catch (error) {
    console.error("[Mailer] Error enviant notificació de comanda llista:", error);
    return false;
  }
}
