import { trpc } from "@/lib/trpc";
import DashboardLayout from "@/components/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { useState } from "react";
import { Trash2, Check, X } from "lucide-react";
import { ShareReviewButton } from "@/components/ShareReviewButton";

export default function AdminWorkshopReviews() {
  const [selectedStatus, setSelectedStatus] = useState<"all" | "pending" | "approved" | "rejected">("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [showThankYou, setShowThankYou] = useState(false);

  const { data: allReviews = [], isLoading, refetch } = trpc.workshopReviews.listAll.useQuery();
  const moderateMutation = trpc.workshopReviews.moderate.useMutation({
    onSuccess: (data, variables) => {
      if (variables.status === "approved") {
        setShowThankYou(true);
        setTimeout(() => setShowThankYou(false), 4000);
      } else {
        toast.success("Estat actualitzat");
      }
      refetch();
    },
    onError: (error) => {
      toast.error(`Error: ${error.message}`);
    },
  });

  const deleteMutation = trpc.workshopReviews.delete.useMutation({
    onSuccess: () => {
      toast.success("Ressenya eliminada");
      refetch();
    },
    onError: (error) => {
      toast.error(`Error: ${error.message}`);
    },
  });

  const filteredReviews = allReviews.filter((review: any) => {
    const matchesStatus = selectedStatus === "all" || review.status === selectedStatus;
    const matchesSearch =
      review.authorName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      review.content.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  const stats = {
    total: allReviews.length,
    pending: allReviews.filter((r: any) => r.status === "pending").length,
    approved: allReviews.filter((r: any) => r.status === "approved").length,
    rejected: allReviews.filter((r: any) => r.status === "rejected").length,
  };

  return (
    <DashboardLayout>
      {showThankYou && (
        <div className="fixed inset-0 flex items-center justify-center z-50 pointer-events-none">
          <div className="bg-white rounded-2xl p-8 shadow-2xl text-center animate-in fade-in zoom-in duration-300">
            <div className="text-5xl mb-4">⭐</div>
            <p className="text-lg font-bold text-gray-800 mb-2">Ressenya publicada!</p>
            <p className="text-gray-600 mb-1">Gràcies pel teu temps⭐</p>
            <p className="text-gray-600">La teva veu ja és visible</p>
          </div>
        </div>
      )}
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold mb-2">Ressenyes de tallers</h1>
          <p className="text-gray-600">Modera i comparteix les ressenyes de tallers i xerrades</p>
        </div>

        {/* Estadístiques */}
        <div className="grid grid-cols-4 gap-4">
          <div className="bg-white p-4 rounded-lg border">
            <div className="text-2xl font-bold">{stats.total}</div>
            <div className="text-sm text-gray-600">Total</div>
          </div>
          <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-200">
            <div className="text-2xl font-bold text-yellow-600">{stats.pending}</div>
            <div className="text-sm text-yellow-700">Pendent</div>
          </div>
          <div className="bg-green-50 p-4 rounded-lg border border-green-200">
            <div className="text-2xl font-bold text-green-600">{stats.approved}</div>
            <div className="text-sm text-green-700">Aprovada</div>
          </div>
          <div className="bg-red-50 p-4 rounded-lg border border-red-200">
            <div className="text-2xl font-bold text-red-600">{stats.rejected}</div>
            <div className="text-sm text-red-700">Rebutjada</div>
          </div>
        </div>

        {/* Filtres */}
        <div className="flex gap-4 items-center">
          <div className="flex gap-2">
            {(["all", "pending", "approved", "rejected"] as const).map((status) => (
              <button
                key={status}
                onClick={() => setSelectedStatus(status)}
                className={`px-4 py-2 rounded-lg font-semibold transition-all ${
                  selectedStatus === status
                    ? "bg-blue-600 text-white"
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                }`}
              >
                {status === "all" ? "Totes" : status === "pending" ? "Pendent" : status === "approved" ? "Aprovades" : "Rebutjades"}
              </button>
            ))}
          </div>
          <Input
            placeholder="Cercar per nom o contingut..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="flex-1"
          />
        </div>

        {/* Llista de ressenyes */}
        <div className="space-y-4">
          {isLoading ? (
            <div className="text-center py-8 text-gray-500">Carregant...</div>
          ) : filteredReviews.length === 0 ? (
            <div className="text-center py-8 text-gray-500">No hi ha ressenyes</div>
          ) : (
            filteredReviews.map((review: any) => (
              <div key={review.id} className="bg-white p-6 rounded-lg border space-y-4">
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <h3 className="font-bold text-lg">{review.authorName}</h3>
                      <span className="text-sm px-2 py-1 rounded-full" style={{
                        background: review.status === "pending" ? "rgb(254, 243, 199)" : review.status === "approved" ? "rgb(220, 252, 231)" : "rgb(254, 226, 226)",
                        color: review.status === "pending" ? "rgb(113, 63, 18)" : review.status === "approved" ? "rgb(22, 101, 52)" : "rgb(127, 29, 29)",
                      }}>
                        {review.status === "pending" ? "Pendent" : review.status === "approved" ? "Aprovada" : "Rebutjada"}
                      </span>
                      <span className="text-sm text-gray-600">
                        {"⭐".repeat(review.rating)}
                      </span>
                    </div>
                    <p className="text-sm text-gray-600 mb-2">
                      Tipus: <strong>{review.eventType === "taller" ? "Taller" : review.eventType === "xerrada" ? "Xerrada" : review.eventType === "presentacio" ? "Presentació" : "Altra"}</strong>
                    </p>
                    <p className="text-gray-700 mb-3">{review.content}</p>
                    <p className="text-xs text-gray-500">
                      {new Date(review.createdAt).toLocaleDateString("ca-ES")}
                    </p>
                  </div>
                </div>

                {/* Accions */}
                <div className="flex gap-2 pt-4 border-t">
                  {review.status === "pending" && (
                    <>
                      <Button
                        onClick={() =>
                          moderateMutation.mutate({ id: review.id, status: "approved" })
                        }
                        size="sm"
                        className="bg-green-600 hover:bg-green-700"
                      >
                        <Check size={16} className="mr-1" />
                        Aprovar
                      </Button>
                      <Button
                        onClick={() =>
                          moderateMutation.mutate({ id: review.id, status: "rejected" })
                        }
                        size="sm"
                        className="bg-red-600 hover:bg-red-700"
                      >
                        <X size={16} className="mr-1" />
                        Rebutjar
                      </Button>
                    </>
                  )}
                  {review.status === "approved" && (
                    <ShareReviewButton
                      authorName={review.authorName}
                      rating={review.rating}
                      eventType={review.eventType}
                      content={review.content}
                    />
                  )}
                  <Button
                    onClick={() => deleteMutation.mutate({ id: review.id })}
                    size="sm"
                    variant="outline"
                    className="text-red-600 hover:text-red-700"
                  >
                    <Trash2 size={16} className="mr-1" />
                    Eliminar
                  </Button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}
