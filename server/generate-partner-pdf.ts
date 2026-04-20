/**
 * Generate Partner Marketing PDF
 * Creates a downloadable PDF with project information and partner instructions
 */

import { PDFDocument, PDFPage, rgb, degrees } from "pdf-lib";
import fs from "fs";
import path from "path";

export async function generatePartnerPDF(): Promise<Buffer> {
  const pdfDoc = await PDFDocument.create();
  const page = pdfDoc.addPage([595, 842]); // A4 size
  const { width, height } = page.getSize();

  // Colors
  const turquoise = rgb(0.2, 0.6, 0.7); // Turquoise
  const darkText = rgb(0.2, 0.2, 0.2); // Dark gray
  const lightBg = rgb(0.95, 0.93, 0.88); // Beige

  let yPosition = height - 50;

  // Header with turquoise background
  page.drawRectangle({
    x: 0,
    y: yPosition - 80,
    width: width,
    height: 80,
    color: turquoise,
  });

  // Title
  page.drawText("El Mar dins Meu", {
    x: 50,
    y: yPosition - 40,
    size: 32,
    color: rgb(1, 1, 1),
    font: await pdfDoc.embedFont("Helvetica-Bold"),
  });

  page.drawText("Projecte educatiu i de sensibilització", {
    x: 50,
    y: yPosition - 65,
    size: 12,
    color: rgb(1, 1, 1),
  });

  yPosition -= 120;

  // Section: About the Project
  drawSection(page, pdfDoc, "Sobre el Projecte", yPosition, width, turquoise, darkText);
  yPosition -= 30;

  const aboutText = `"El Mar dins Meu" és un projecte educatiu i de sensibilització sobre l'abús sexual infantil. 
Combina un àlbum il·lustrat amb samarretes de difusió per trencar silencis i construir comunitat.

L'objectiu és arribar a famílies, escoles i comunitats per promoure la prevenció i la conversa oberta 
sobre aquest tema tan important.`;

  yPosition = drawWrappedText(page, aboutText, 50, yPosition - 10, width - 100, 11, darkText);
  yPosition -= 20;

  // Section: Why Become a Partner
  drawSection(page, pdfDoc, "Per què ser Punt de Recollida?", yPosition, width, turquoise, darkText);
  yPosition -= 30;

  const reasons = [
    "✓ Formar part d'un moviment de sensibilització important",
    "✓ Oferir un producte únic i significatiu als teus clients",
    "✓ Contribuir a la prevenció de l'abús sexual infantil",
    "✓ Rebre suport de materials de difusió i promoció",
    "✓ Ser part d'una xarxa de punts de recollida a tot el país",
  ];

  for (const reason of reasons) {
    page.drawText(reason, {
      x: 50,
      y: yPosition,
      size: 10,
      color: darkText,
    });
    yPosition -= 15;
  }

  yPosition -= 10;

  // Section: Products
  drawSection(page, pdfDoc, "Els Productes", yPosition, width, turquoise, darkText);
  yPosition -= 30;

  page.drawText("Samarretes 'El Mar dins Meu'", {
    x: 50,
    y: yPosition,
    size: 12,
    color: turquoise,
    font: await pdfDoc.embedFont("Helvetica-Bold"),
  });
  yPosition -= 20;

  page.drawText("• Samarreta Adults: 18€", {
    x: 70,
    y: yPosition,
    size: 10,
    color: darkText,
  });
  yPosition -= 12;

  page.drawText("• Samarreta Infants: 15€", {
    x: 70,
    y: yPosition,
    size: 10,
    color: darkText,
  });
  yPosition -= 12;

  page.drawText("• Àlbum il·lustrat: 16€", {
    x: 70,
    y: yPosition,
    size: 10,
    color: darkText,
  });

  yPosition -= 25;

  // Section: How to Register
  drawSection(page, pdfDoc, "Com Registrar-te", yPosition, width, turquoise, darkText);
  yPosition -= 30;

  const steps = [
    "1. Visita elmardinsmeu.cat/registre-punt-recollida",
    "2. Omple el formulari amb la teva informació",
    "3. Rebràs confirmació quan s'aprovi la teva sol·licitud",
    "4. Comença a rebre comandes i ofereix els productes als teus clients",
  ];

  for (const step of steps) {
    page.drawText(step, {
      x: 50,
      y: yPosition,
      size: 10,
      color: darkText,
    });
    yPosition -= 15;
  }

  yPosition -= 10;

  // Section: Contact
  drawSection(page, pdfDoc, "Contacte", yPosition, width, turquoise, darkText);
  yPosition -= 30;

  page.drawText("Email: escoltem@elmardinsmeu.cat", {
    x: 50,
    y: yPosition,
    size: 10,
    color: darkText,
  });
  yPosition -= 12;

  page.drawText("WhatsApp: Contacta'ns a través de la web", {
    x: 50,
    y: yPosition,
    size: 10,
    color: darkText,
  });

  // Footer
  page.drawText("Juntes trenquem silencis i construïm comunitat", {
    x: 50,
    y: 30,
    size: 10,
    color: turquoise,
    font: await pdfDoc.embedFont("Helvetica-Oblique"),
  });

  // Save PDF
  const pdfBytes = await pdfDoc.save();
  return Buffer.from(pdfBytes);
}

function drawSection(
  page: PDFPage,
  pdfDoc: PDFDocument,
  title: string,
  yPosition: number,
  width: number,
  color: ReturnType<typeof rgb>,
  textColor: ReturnType<typeof rgb>
): void {
  page.drawRectangle({
    x: 50,
    y: yPosition - 20,
    width: width - 100,
    height: 20,
    color,
  });

  page.drawText(title, {
    x: 60,
    y: yPosition - 15,
    size: 12,
    color: rgb(1, 1, 1),
  });
}

function drawWrappedText(
  page: PDFPage,
  text: string,
  x: number,
  y: number,
  maxWidth: number,
  fontSize: number,
  color: ReturnType<typeof rgb>
): number {
  const words = text.split(" ");
  let line = "";
  let currentY = y;

  for (const word of words) {
    const testLine = line + (line ? " " : "") + word;
    const textWidth = testLine.length * (fontSize * 0.5); // Approximate

    if (textWidth > maxWidth && line) {
      page.drawText(line, {
        x,
        y: currentY,
        size: fontSize,
        color,
      });
      line = word;
      currentY -= fontSize + 5;
    } else {
      line = testLine;
    }
  }

  if (line) {
    page.drawText(line, {
      x,
      y: currentY,
      size: fontSize,
      color,
    });
    currentY -= fontSize + 5;
  }

  return currentY;
}
