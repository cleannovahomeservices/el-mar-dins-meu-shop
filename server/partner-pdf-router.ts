/**
 * Partner PDF Router
 * tRPC procedures for partner marketing materials
 */

import { publicProcedure } from "./_core/trpc";
import { generatePartnerPDF } from "./generate-partner-pdf";

export const partnerPdfRouter = {
  downloadMaterials: publicProcedure.query(async () => {
    try {
      const pdfBuffer = await generatePartnerPDF();
      return {
        success: true,
        buffer: pdfBuffer.toString("base64"),
        filename: "El-Mar-dins-Meu-Materials-Partners.pdf",
      };
    } catch (error) {
      console.error("[Partner PDF] Error generating PDF:", error);
      throw new Error("Failed to generate PDF");
    }
  }),
};
