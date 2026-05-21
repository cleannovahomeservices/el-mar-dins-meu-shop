import { useState } from "react";
import { trpc } from "@/lib/trpc";
import DashboardLayout from "@/components/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { Trash2, Check, X, Pencil } from "lucide-react";

type PickupPoint = {
  id: number;
  name: string;
  type: string;
  address: string;
  city: string;
  postalCode: string;
  phone: string;
  email: string;
  contactPerson: string;
  description?: string | null;
  website?: string | null;
  openingHours?: string | null;
  status: string;
  latitude?: string | null;
  longitude?: string | null;
};

type EditForm = Omit<PickupPoint, "id" | "status" | "latitude" | "longitude">;

export default function AdminPickupPoints() {
  const [selectedStatus, setSelectedStatus] = useState<"all" | "pending" | "approved" | "rejected">("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [editingPoint, setEditingPoint] = useState<PickupPoint | null>(null);
  const [editForm, setEditForm] = useState<EditForm | null>(null);

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

  const updateMutation = trpc.pickupPoints.update.useMutation({
    onSuccess: () => {
      toast.success("Punt de recollida actualitzat");
      setEditingPoint(null);
      setEditForm(null);
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

  const filteredPoints = (allPoints as PickupPoint[]).filter((point) => {
    const matchesStatus = selectedStatus === "all" || point.status === selectedStatus;
    const matchesSearch =
      point.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      point.city.toLowerCase().includes(searchTerm.toLowerCase()) ||
      point.email.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  const stats = {
    total: allPoints.length,
    pending: (allPoints as PickupPoint[]).filter((p) => p.status === "pending").length,
    approved: (allPoints as PickupPoint[]).filter((p) => p.status === "approved").length,
    rejected: (allPoints as PickupPoint[]).filter((p) => p.status === "rejected").length,
  };

  function openEdit(point: PickupPoint) {
    setEditingPoint(point);
    setEditForm({
      name: point.name,
      type: point.type as EditForm["type"],
      address: point.address,
      city: point.city,
      postalCode: point.postalCode,
      phone: point.phone,
      email: point.email,
      contactPerson: point.contactPerson,
      description: point.description ?? "",
      website: point.website ?? "",
      openingHours: point.openingHours ?? "",
    });
  }

  function handleEditChange(e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) {
    const { name, value } = e.target;
    setEditForm((prev) => prev ? { ...prev, [name]: value } : prev);
  }

  function handleEditSave() {
    if (!editingPoint || !editForm) return;
    updateMutation.mutate({
      id: editingPoint.id,
      ...editForm,
      description: editForm.description || null,
      website: editForm.website || null,
      openingHours: editForm.openingHours || null,
    });
  }

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
                  {filteredPoints.map((point) => (
                    <tr key={point.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 text-sm font-medium">
                        {point.name}
                        {!point.latitude && (
                          <span className="ml-2 text-xs text-orange-500" title="Sense coordenades GPS">⚠️</span>
                        )}
                      </td>
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
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => openEdit(point)}
                            title="Editar"
                          >
                            <Pencil size={16} />
                          </Button>
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
            {filteredPoints.map((point) => (
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
                  {!point.latitude && (
                    <div className="col-span-2 bg-orange-50 border border-orange-200 rounded p-3 text-sm text-orange-700">
                      ⚠️ Sense coordenades GPS — la geocodificació va fallar en el registre. Pots editar l'adreça per intentar-ho de nou o assignar-les manualment.
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Modal d'edició */}
      {editingPoint && editForm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b">
              <h2 className="text-xl font-bold">Editar punt de recollida</h2>
              <p className="text-sm text-gray-500 mt-1">{editingPoint.name}</p>
            </div>
            <div className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2">
                  <label className="block text-sm font-semibold mb-1">Nom</label>
                  <Input name="name" value={editForm.name} onChange={handleEditChange} />
                </div>
                <div>
                  <label className="block text-sm font-semibold mb-1">Tipus</label>
                  <select
                    name="type"
                    value={editForm.type}
                    onChange={handleEditChange}
                    className="w-full px-3 py-2 border rounded-lg text-sm"
                  >
                    <option value="botiga">Botiga</option>
                    <option value="entitat">Entitat</option>
                    <option value="associacio">Associació</option>
                    <option value="altra">Altra</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-semibold mb-1">Telèfon</label>
                  <Input name="phone" value={editForm.phone} onChange={handleEditChange} />
                </div>
                <div className="col-span-2">
                  <label className="block text-sm font-semibold mb-1">Adreça</label>
                  <Input name="address" value={editForm.address} onChange={handleEditChange} />
                </div>
                <div>
                  <label className="block text-sm font-semibold mb-1">Ciutat</label>
                  <Input name="city" value={editForm.city} onChange={handleEditChange} />
                </div>
                <div>
                  <label className="block text-sm font-semibold mb-1">Codi postal</label>
                  <Input name="postalCode" value={editForm.postalCode} onChange={handleEditChange} />
                </div>
                <div>
                  <label className="block text-sm font-semibold mb-1">Email</label>
                  <Input name="email" value={editForm.email} onChange={handleEditChange} />
                </div>
                <div>
                  <label className="block text-sm font-semibold mb-1">Persona de contacte</label>
                  <Input name="contactPerson" value={editForm.contactPerson} onChange={handleEditChange} />
                </div>
                <div className="col-span-2">
                  <label className="block text-sm font-semibold mb-1">Horari d'atenció</label>
                  <Input name="openingHours" value={editForm.openingHours ?? ""} onChange={handleEditChange} placeholder="Ex: Dilluns-Divendres 9-19h" />
                </div>
                <div className="col-span-2">
                  <label className="block text-sm font-semibold mb-1">Web</label>
                  <Input name="website" value={editForm.website ?? ""} onChange={handleEditChange} placeholder="https://exemple.cat" />
                </div>
                <div className="col-span-2">
                  <label className="block text-sm font-semibold mb-1">Descripció</label>
                  <Textarea name="description" value={editForm.description ?? ""} onChange={handleEditChange} rows={3} />
                </div>
              </div>
            </div>
            <div className="p-6 border-t flex gap-3 justify-end">
              <Button
                variant="outline"
                onClick={() => { setEditingPoint(null); setEditForm(null); }}
                disabled={updateMutation.isPending}
              >
                Cancel·lar
              </Button>
              <Button onClick={handleEditSave} disabled={updateMutation.isPending}>
                {updateMutation.isPending ? "Desant..." : "Desar canvis"}
              </Button>
            </div>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
}
