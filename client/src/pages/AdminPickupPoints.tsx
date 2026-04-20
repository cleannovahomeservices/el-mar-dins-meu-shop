import { useState } from "react";
import { trpc } from "@/lib/trpc";
import DashboardLayout from "@/components/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { Trash2, Check, X } from "lucide-react";

export default function AdminPickupPoints() {
  const [selectedStatus, setSelectedStatus] = useState<"all" | "pending" | "approved" | "rejected">("all");
  const [searchTerm, setSearchTerm] = useState("");

  const { data: allPoints = [], isLoading, refetch } = trpc.pickupPoints.listAll.useQuery();
  const moderateMutation = trpc.pickupPoints.moderate.useMutation({
    onSuccess: () => {
      toast.success("Estat actualitzat");
      refetch();
    },
    onError: (error) => {
      toast.error(`Error: ${error.message}`);
    },
  });

  const deleteMutation = trpc.pickupPoints.delete.useMutation({
    onSuccess: () => {
      toast.success("Punt de recollida eliminat");
      refetch();
    },
    onError: (error) => {
      toast.error(`Error: ${error.message}`);
    },
  });

  const filteredPoints = allPoints.filter((point: any) => {
    const matchesStatus = selectedStatus === "all" || point.status === selectedStatus;
    const matchesSearch =
      point.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      point.city.toLowerCase().includes(searchTerm.toLowerCase()) ||
      point.email.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  const stats = {
    total: allPoints.length,
    pending: allPoints.filter((p: any) => p.status === "pending").length,
    approved: allPoints.filter((p: any) => p.status === "approved").length,
    rejected: allPoints.filter((p: any) => p.status === "rejected").length,
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Punts de recollida</h1>
          <p className="text-sm text-gray-600 mt-1">Gestiona els punts de recollida registrats</p>
        </div>

        {/* Estadístiques */}
        <div className="grid grid-cols-4 gap-4">
          <div className="bg-white p-4 rounded-lg border">
            <p className="text-sm text-gray-600">Total</p>
            <p className="text-2xl font-bold">{stats.total}</p>
          </div>
          <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-200">
            <p className="text-sm text-yellow-700">Pendents</p>
            <p className="text-2xl font-bold text-yellow-700">{stats.pending}</p>
          </div>
          <div className="bg-green-50 p-4 rounded-lg border border-green-200">
            <p className="text-sm text-green-700">Aprovats</p>
            <p className="text-2xl font-bold text-green-700">{stats.approved}</p>
          </div>
          <div className="bg-red-50 p-4 rounded-lg border border-red-200">
            <p className="text-sm text-red-700">Rebutjats</p>
            <p className="text-2xl font-bold text-red-700">{stats.rejected}</p>
          </div>
        </div>

        {/* Filtres */}
        <div className="flex gap-4 flex-wrap">
          <Input
            placeholder="Cercar per nom, ciutat o email..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="flex-1 min-w-64"
          />
          <div className="flex gap-2">
            {(["all", "pending", "approved", "rejected"] as const).map((status) => (
              <Button
                key={status}
                variant={selectedStatus === status ? "default" : "outline"}
                onClick={() => setSelectedStatus(status)}
                className="capitalize"
              >
                {status === "all" ? "Tots" : status === "pending" ? "Pendents" : status === "approved" ? "Aprovats" : "Rebutjats"}
              </Button>
            ))}
          </div>
        </div>

        {/* Taula */}
        <div className="bg-white rounded-lg border overflow-hidden">
          {isLoading ? (
            <div className="p-8 text-center text-gray-500">Carregant...</div>
          ) : filteredPoints.length === 0 ? (
            <div className="p-8 text-center text-gray-500">No hi ha punts de recollida que coincideixin</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b">
                  <tr>
                    <th className="px-6 py-3 text-left text-sm font-semibold">Nom</th>
                    <th className="px-6 py-3 text-left text-sm font-semibold">Tipus</th>
                    <th className="px-6 py-3 text-left text-sm font-semibold">Ciutat</th>
                    <th className="px-6 py-3 text-left text-sm font-semibold">Contacte</th>
                    <th className="px-6 py-3 text-left text-sm font-semibold">Email</th>
                    <th className="px-6 py-3 text-left text-sm font-semibold">Estat</th>
                    <th className="px-6 py-3 text-left text-sm font-semibold">Accions</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {filteredPoints.map((point: any) => (
                    <tr key={point.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 text-sm font-medium">{point.name}</td>
                      <td className="px-6 py-4 text-sm capitalize">{point.type}</td>
                      <td className="px-6 py-4 text-sm">{point.city}</td>
                      <td className="px-6 py-4 text-sm">{point.contactPerson}</td>
                      <td className="px-6 py-4 text-sm">{point.email}</td>
                      <td className="px-6 py-4 text-sm">
                        <span
                          className={`px-3 py-1 rounded-full text-xs font-semibold ${
                            point.status === "approved"
                              ? "bg-green-100 text-green-700"
                              : point.status === "pending"
                              ? "bg-yellow-100 text-yellow-700"
                              : "bg-red-100 text-red-700"
                          }`}
                        >
                          {point.status === "approved" ? "Aprovat" : point.status === "pending" ? "Pendent" : "Rebutjat"}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm">
                        <div className="flex gap-2">
                          {point.status !== "approved" && (
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => moderateMutation.mutate({ id: point.id, status: "approved" })}
                              disabled={moderateMutation.isPending}
                              className="text-green-600 hover:text-green-700"
                            >
                              <Check size={16} />
                            </Button>
                          )}
                          {point.status !== "rejected" && (
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => moderateMutation.mutate({ id: point.id, status: "rejected" })}
                              disabled={moderateMutation.isPending}
                              className="text-red-600 hover:text-red-700"
                            >
                              <X size={16} />
                            </Button>
                          )}
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => deleteMutation.mutate({ id: point.id })}
                            disabled={deleteMutation.isPending}
                            className="text-red-600 hover:text-red-700"
                          >
                            <Trash2 size={16} />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Detalls de punts */}
        {filteredPoints.length > 0 && (
          <div className="space-y-4">
            <h2 className="text-lg font-semibold">Detalls dels punts de recollida</h2>
            {filteredPoints.map((point: any) => (
              <div key={point.id} className="bg-white p-6 rounded-lg border">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-600">Nom</p>
                    <p className="font-semibold">{point.name}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Tipus</p>
                    <p className="font-semibold capitalize">{point.type}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Adreça</p>
                    <p className="font-semibold">{point.address}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Ciutat</p>
                    <p className="font-semibold">{point.city} {point.postalCode}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Telèfon</p>
                    <p className="font-semibold">{point.phone}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Email</p>
                    <p className="font-semibold">{point.email}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Persona de contacte</p>
                    <p className="font-semibold">{point.contactPerson}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Horari d'atenció</p>
                    <p className="font-semibold">{point.openingHours || "No especificat"}</p>
                  </div>
                  {point.description && (
                    <div className="col-span-2">
                      <p className="text-sm text-gray-600">Descripció</p>
                      <p className="font-semibold">{point.description}</p>
                    </div>
                  )}
                  {point.website && (
                    <div className="col-span-2">
                      <p className="text-sm text-gray-600">Web</p>
                      <a href={point.website} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
                        {point.website}
                      </a>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
