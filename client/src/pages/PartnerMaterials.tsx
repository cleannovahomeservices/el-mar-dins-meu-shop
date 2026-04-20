/**
 * Partner Materials Page
 * Download marketing materials for partners
 */

import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Loader2, Download, FileText } from "lucide-react";
import { toast } from "sonner";

export default function PartnerMaterials() {
  const [isDownloading, setIsDownloading] = useState(false);
  const downloadPdf = trpc.partnerPdf.downloadMaterials.useQuery(
    undefined,
    { enabled: false }
  );

  const handleDownload = async () => {
    setIsDownloading(true);
    try {
      const result = await downloadPdf.refetch();
      
      if (result.data?.success && result.data?.buffer) {
        // Convert base64 to blob
        const binaryString = atob(result.data.buffer);
        const bytes = new Uint8Array(binaryString.length);
        for (let i = 0; i < binaryString.length; i++) {
          bytes[i] = binaryString.charCodeAt(i);
        }
        const blob = new Blob([bytes], { type: "application/pdf" });

        // Create download link
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.href = url;
        link.download = result.data.filename || "El-Mar-dins-Meu-Materials-Partners.pdf";
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        window.URL.revokeObjectURL(url);

        toast.success("PDF descarregat correctament!");
      }
    } catch (error) {
      console.error("Error downloading PDF:", error);
      toast.error("Error al descarregar el PDF");
    } finally {
      setIsDownloading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-teal-50 py-12 px-4">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Materials per a Partners
          </h1>
          <p className="text-lg text-gray-600">
            Descarrega els materials de difusió del projecte "El Mar dins Meu"
          </p>
        </div>

        {/* Main Card */}
        <div className="bg-white rounded-lg shadow-lg p-8 mb-8">
          <div className="flex items-center justify-center mb-6">
            <FileText className="w-16 h-16 text-teal-600" />
          </div>

          <h2 className="text-2xl font-bold text-center text-gray-900 mb-4">
            Guia de Partners
          </h2>

          <p className="text-gray-600 text-center mb-6">
            Aquest document conté tota la informació que necessites per oferir-te com a punt de recollida:
          </p>

          <ul className="space-y-3 mb-8 text-gray-700">
            <li className="flex items-start">
              <span className="text-teal-600 font-bold mr-3">✓</span>
              <span>Informació sobre el projecte i els seus objectius</span>
            </li>
            <li className="flex items-start">
              <span className="text-teal-600 font-bold mr-3">✓</span>
              <span>Detalls dels productes i preus</span>
            </li>
            <li className="flex items-start">
              <span className="text-teal-600 font-bold mr-3">✓</span>
              <span>Instruccions per registrar-te com a punt de recollida</span>
            </li>
            <li className="flex items-start">
              <span className="text-teal-600 font-bold mr-3">✓</span>
              <span>Informació de contacte i suport</span>
            </li>
          </ul>

          <button
            onClick={handleDownload}
            disabled={isDownloading}
            className="w-full bg-teal-600 hover:bg-teal-700 disabled:bg-gray-400 text-white font-bold py-3 px-6 rounded-lg flex items-center justify-center gap-2 transition-colors"
          >
            {isDownloading ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                Descarregant...
              </>
            ) : (
              <>
                <Download className="w-5 h-5" />
                Descarregar PDF
              </>
            )}
          </button>
        </div>

        {/* Info Box */}
        <div className="bg-blue-50 border-l-4 border-blue-600 p-6 rounded">
          <h3 className="font-bold text-blue-900 mb-2">
            Preguntes?
          </h3>
          <p className="text-blue-800 mb-4">
            Si tens dubtes sobre com ser un punt de recollida, contacta'ns:
          </p>
          <div className="space-y-2 text-blue-800">
            <p>
              📧 Email: <a href="mailto:escoltem@elmardinsmeu.cat" className="underline hover:text-blue-600">
                escoltem@elmardinsmeu.cat
              </a>
            </p>
            <p>
              💬 WhatsApp: Contacta'ns a través de la web
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
