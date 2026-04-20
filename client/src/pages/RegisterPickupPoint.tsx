import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";
import { ChevronLeft, Loader2 } from "lucide-react";
import { useLocation } from "wouter";
import AddressAutocomplete from "@/components/AddressAutocomplete";

export default function RegisterPickupPoint() {
  const [, setLocation] = useLocation();
  const [formData, setFormData] = useState({
    name: "",
    type: "botiga" as "entitat" | "associacio" | "botiga" | "altra",
    address: "",
    city: "",
    postalCode: "",
    phone: "",
    email: "",
    contactPerson: "",
    description: "",
    website: "",
    openingHours: "",
  });

  const registerMutation = trpc.pickupPoints.register.useMutation({
    onSuccess: () => {
      toast.success("✅ Registre enviat! Gràcies per participar en el projecte.");
      setFormData({
        name: "",
        type: "botiga",
        address: "",
        city: "",
        postalCode: "",
        phone: "",
        email: "",
        contactPerson: "",
        description: "",
        website: "",
        openingHours: "",
      });
      setTimeout(() => setLocation("/"), 2000);
    },
    onError: (error) => {
      toast.error(`❌ Error: ${error.message}`);
    },
  });

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    registerMutation.mutate(formData);
  };

  return (
    <div className="min-h-screen" style={{ background: "oklch(0.98 0.01 75)" }}>
      {/* Header */}
      <div
        className="py-6 px-4 shadow-sm"
        style={{ background: "oklch(0.35 0.1 200)" }}
      >
        <div className="container flex items-center gap-3">
          <button
            onClick={() => setLocation("/")}
            className="p-2 hover:opacity-80 transition-opacity"
          >
            <ChevronLeft size={24} className="text-white" />
          </button>
          <h1 className="text-2xl font-bold text-white">Registra't com a punt de recollida</h1>
        </div>
      </div>

      {/* Form */}
      <div className="container py-12 px-4">
        <div className="max-w-2xl mx-auto bg-white rounded-2xl p-8 shadow-lg">
          <p className="text-sm mb-8" style={{ color: "oklch(0.5 0.05 55)" }}>
            Ets una entitat, associació, botiga o negoci que vols ser punt de recollida de les samarretes "El Mar dins Meu"?
            Completa aquest formulari i ens posarem en contacte per confirmar la col·laboració.
          </p>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Nom de l'entitat */}
            <div>
              <label className="block text-sm font-semibold mb-2" style={{ color: "oklch(0.35 0.07 55)" }}>
                Nom de l'entitat / botiga / associació *
              </label>
              <Input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                placeholder="Ex: Peluqueria Alicia"
                required
                className="w-full"
              />
            </div>

            {/* Tipus */}
            <div>
              <label className="block text-sm font-semibold mb-2" style={{ color: "oklch(0.35 0.07 55)" }}>
                Tipus d'organització *
              </label>
              <select
                name="type"
                value={formData.type}
                onChange={handleChange}
                className="w-full px-4 py-2 border rounded-lg"
                style={{ borderColor: "oklch(0.72 0.08 200 / 0.3)" }}
              >
                <option value="botiga">Botiga</option>
                <option value="entitat">Entitat</option>
                <option value="associacio">Associació</option>
                <option value="altra">Altra</option>
              </select>
            </div>

            {/* Adreça amb Autocomplete */}
            <div>
              <label className="block text-sm font-semibold mb-2" style={{ color: "oklch(0.35 0.07 55)" }}>
                Adreça completa *
              </label>
              <AddressAutocomplete
                value={formData.address}
                onChange={(value) => setFormData((prev) => ({ ...prev, address: value }))}
                onAddressSelected={(addressData) => {
                  setFormData((prev) => ({
                    ...prev,
                    address: addressData.street,
                    city: addressData.city,
                    postalCode: addressData.postalCode,
                  }));
                }}
                placeholder="Ex: Carrer Major, 15"
              />
            </div>

            {/* Ciutat i Codi postal */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold mb-2" style={{ color: "oklch(0.35 0.07 55)" }}>
                  Ciutat *
                </label>
                <Input
                  type="text"
                  name="city"
                  value={formData.city}
                  onChange={handleChange}
                  placeholder="Ex: Vilafranca del Penedès"
                  required
                  className="w-full"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold mb-2" style={{ color: "oklch(0.35 0.07 55)" }}>
                  Codi postal *
                </label>
                <Input
                  type="text"
                  name="postalCode"
                  value={formData.postalCode}
                  onChange={handleChange}
                  placeholder="Ex: 08720"
                  required
                  className="w-full"
                />
              </div>
            </div>

            {/* Telèfon i Email */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold mb-2" style={{ color: "oklch(0.35 0.07 55)" }}>
                  Telèfon *
                </label>
                <Input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  placeholder="Ex: 938 123 456"
                  required
                  className="w-full"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold mb-2" style={{ color: "oklch(0.35 0.07 55)" }}>
                  Email *
                </label>
                <Input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="contacte@exemple.cat"
                  required
                  className="w-full"
                />
              </div>
            </div>

            {/* Persona de contacte */}
            <div>
              <label className="block text-sm font-semibold mb-2" style={{ color: "oklch(0.35 0.07 55)" }}>
                Persona de contacte *
              </label>
              <Input
                type="text"
                name="contactPerson"
                value={formData.contactPerson}
                onChange={handleChange}
                placeholder="Ex: Alicia García"
                required
                className="w-full"
              />
            </div>

            {/* Descripció */}
            <div>
              <label className="block text-sm font-semibold mb-2" style={{ color: "oklch(0.35 0.07 55)" }}>
                Descripció breu (opcional)
              </label>
              <Textarea
                name="description"
                value={formData.description}
                onChange={handleChange}
                placeholder="Ex: Peluqueria amb més de 20 anys d'experiència a Vilafranca"
                className="w-full"
                rows={3}
              />
            </div>

            {/* Web i Horari */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold mb-2" style={{ color: "oklch(0.35 0.07 55)" }}>
                  Web (opcional)
                </label>
                <Input
                  type="url"
                  name="website"
                  value={formData.website}
                  onChange={handleChange}
                  placeholder="https://exemple.cat"
                  className="w-full"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold mb-2" style={{ color: "oklch(0.35 0.07 55)" }}>
                  Horari d'atenció (opcional)
                </label>
                <Input
                  type="text"
                  name="openingHours"
                  value={formData.openingHours}
                  onChange={handleChange}
                  placeholder="Ex: Dilluns-Divendres 9-19h"
                  className="w-full"
                />
              </div>
            </div>

            {/* Botó d'envio */}
            <div className="flex gap-3 pt-6">
              <Button
                type="button"
                variant="outline"
                onClick={() => setLocation("/")}
                className="flex-1"
              >
                Cancelar
              </Button>
              <Button
                type="submit"
                disabled={registerMutation.isPending}
                className="flex-1"
                style={{ background: "oklch(0.35 0.1 200)" }}
              >
                {registerMutation.isPending ? "Enviant..." : "Registrar-se"}
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
