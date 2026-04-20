/* =============================================================
   Contact — El Mar dins Meu
   Disseny: Mediterrània Artesanal (turquesa, beix, polaroid)
   Formulari de consultes generals sobre el projecte
   ============================================================= */

import { useState } from "react";
import { Link } from "wouter";
import { ArrowLeft, Send, Mail, Instagram, Heart, CheckCircle } from "lucide-react";

// ── Icona vaixell de paper ────────────────────────────────────
function BoatIcon({ size = 22, color = "oklch(0.45 0.1 200)" }: { size?: number; color?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M3 17L12 3L21 17H3Z" stroke={color} strokeWidth="1.8" strokeLinejoin="round" fill="none" />
      <path d="M2 20C2 20 6 22 12 22C18 22 22 20 22 20" stroke={color} strokeWidth="1.8" strokeLinecap="round" />
      <line x1="12" y1="3" x2="12" y2="17" stroke={color} strokeWidth="1.2" strokeLinecap="round" />
    </svg>
  );
}

// ── Estat del formulari ───────────────────────────────────────
type FormState = {
  nom: string;
  email: string;
  motiu: string;
  missatge: string;
};

const MOTIUS = [
  "Informació sobre el projecte",
  "Col·laboració o associació",
  "Presentació o activitat",
  "Premsa i comunicació",
  "Altres consultes",
];

export default function Contact() {
  const [form, setForm] = useState<FormState>({
    nom: "",
    email: "",
    motiu: "",
    missatge: "",
  });
  const [errors, setErrors] = useState<Partial<FormState>>({});
  const [sent, setSent] = useState(false);
  const [sending, setSending] = useState(false);

  function validate(): boolean {
    const e: Partial<FormState> = {};
    if (!form.nom.trim()) e.nom = "El nom és obligatori";
    if (!form.email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email))
      e.email = "Introdueix un correu vàlid";
    if (!form.motiu) e.motiu = "Selecciona el motiu de la consulta";
    if (!form.missatge.trim() || form.missatge.trim().length < 20)
      e.missatge = "El missatge ha de tenir almenys 20 caràcters";
    setErrors(e);
    return Object.keys(e).length === 0;
  }

  function handleChange(
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
    if (errors[name as keyof FormState]) {
      setErrors(prev => ({ ...prev, [name]: undefined }));
    }
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!validate()) return;

    setSending(true);

    // Construir el cos del correu via mailto
    const subject = encodeURIComponent(`[El Mar dins Meu] ${form.motiu} — ${form.nom}`);
    const body = encodeURIComponent(
      `Nom: ${form.nom}\nCorreu: ${form.email}\nMotiu: ${form.motiu}\n\n${form.missatge}`
    );
    const mailtoLink = `mailto:elmardinsmeu@gmail.com?subject=${subject}&body=${body}`;

    // Obrir el client de correu
    window.location.href = mailtoLink;

    // Simular enviament i mostrar confirmació
    setTimeout(() => {
      setSending(false);
      setSent(true);
    }, 800);
  }

  function handleReset() {
    setForm({ nom: "", email: "", motiu: "", missatge: "" });
    setErrors({});
    setSent(false);
  }

  const inputBase = {
    fontFamily: "'Nunito', sans-serif",
    border: "2px solid oklch(0.88 0.06 75)",
    borderRadius: "12px",
    padding: "12px 16px",
    fontSize: "15px",
    color: "oklch(0.3 0.06 50)",
    background: "white",
    outline: "none",
    width: "100%",
    transition: "border-color 0.2s",
  };

  const labelStyle = {
    fontFamily: "'Nunito', sans-serif",
    fontWeight: 700,
    fontSize: "13px",
    color: "oklch(0.4 0.06 55)",
    display: "block",
    marginBottom: "6px",
  };

  const errorStyle = {
    fontFamily: "'Nunito', sans-serif",
    fontSize: "12px",
    color: "oklch(0.55 0.2 30)",
    marginTop: "4px",
  };

  return (
    <div className="min-h-screen" style={{ background: "oklch(0.72 0.08 200)" }}>

      {/* ===== HEADER ===== */}
      <header className="sticky top-0 z-30 backdrop-blur-md"
        style={{ background: "oklch(0.55 0.1 200 / 0.95)", boxShadow: "0 2px 20px rgba(0,0,0,0.15)" }}>
        <div className="container flex items-center justify-between py-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full flex items-center justify-center"
              style={{ background: "oklch(0.88 0.06 75)" }}>
              <BoatIcon size={22} color="oklch(0.45 0.1 200)" />
            </div>
            <div>
              <h1 className="text-white font-black text-lg leading-none"
                style={{ fontFamily: "'Playfair Display', serif" }}>
                El Mar dins Meu
              </h1>
              <p className="text-white/80 leading-tight"
                style={{ fontFamily: "'Nunito', sans-serif", fontSize: "10px" }}>
                Fem visible, l'invisible.
              </p>
            </div>
          </div>

          <Link href="/"
            className="flex items-center gap-2 px-4 py-2 rounded-full font-bold text-sm transition-all hover:scale-105"
            style={{
              background: "oklch(0.88 0.06 75)",
              color: "oklch(0.35 0.07 55)",
              fontFamily: "'Nunito', sans-serif",
              textDecoration: "none",
            }}>
            <ArrowLeft size={16} />
            <span className="hidden sm:inline">Tornar a la botiga</span>
          </Link>
        </div>
      </header>

      {/* ===== HERO PETIT ===== */}
      <section className="py-12 text-center px-4">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full mb-5"
          style={{ background: "oklch(0.88 0.06 75 / 0.3)", border: "3px solid oklch(0.88 0.06 75 / 0.5)" }}>
          <Mail size={28} style={{ color: "oklch(0.88 0.06 75)" }} />
        </div>
        <h2 className="text-white font-black text-3xl sm:text-4xl drop-shadow mb-3"
          style={{ fontFamily: "'Playfair Display', serif" }}>
          Contacta amb nosaltres
        </h2>
        <p className="text-white/85 text-base max-w-lg mx-auto leading-relaxed"
          style={{ fontFamily: "'Nunito', sans-serif" }}>
          Tens alguna pregunta sobre el projecte, vols col·laborar o organitzar una activitat?
          Escriu-nos i et respondrem el més aviat possible.
        </p>
      </section>

      {/* ===== CONTINGUT PRINCIPAL ===== */}
      <div className="container pb-16">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">

          {/* ── Informació de contacte ── */}
          <div className="lg:col-span-1 space-y-5">

            {/* Targeta info */}
            <div className="rounded-2xl p-6 shadow-lg"
              style={{
                background: "white",
                border: "3px solid oklch(0.88 0.06 75)",
                transform: "rotate(-1deg)",
              }}>
              <h3 className="font-black text-lg mb-4"
                style={{ fontFamily: "'Playfair Display', serif", color: "oklch(0.3 0.06 50)" }}>
                Informació de contacte
              </h3>

              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <div className="w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5"
                    style={{ background: "oklch(0.72 0.08 200 / 0.15)" }}>
                    <Mail size={16} style={{ color: "oklch(0.45 0.1 200)" }} />
                  </div>
                  <div>
                    <p className="font-bold text-sm" style={{ color: "oklch(0.4 0.06 55)", fontFamily: "'Nunito', sans-serif" }}>
                      Correu electrònic
                    </p>
                    <a href="mailto:elmardinsmeu@gmail.com"
                      className="text-sm hover:underline"
                      style={{ color: "oklch(0.45 0.1 200)", fontFamily: "'Nunito', sans-serif" }}>
                      elmardinsmeu@gmail.com
                    </a>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5"
                    style={{ background: "oklch(0.72 0.08 200 / 0.15)" }}>
                    <Instagram size={16} style={{ color: "oklch(0.45 0.1 200)" }} />
                  </div>
                  <div>
                    <p className="font-bold text-sm" style={{ color: "oklch(0.4 0.06 55)", fontFamily: "'Nunito', sans-serif" }}>
                      Instagram
                    </p>
                    <a href="https://www.instagram.com/elmardinsmeu/" target="_blank" rel="noopener noreferrer"
                      className="text-sm hover:underline"
                      style={{ color: "oklch(0.45 0.1 200)", fontFamily: "'Nunito', sans-serif" }}>
                      @elmardinsmeu
                    </a>
                  </div>
                </div>
              </div>
            </div>

            {/* Targeta motius habituals */}
            <div className="rounded-2xl p-6 shadow-md"
              style={{
                background: "oklch(0.88 0.06 75 / 0.25)",
                border: "2px solid oklch(0.88 0.06 75 / 0.5)",
                transform: "rotate(0.8deg)",
              }}>
              <h3 className="font-black text-base mb-3"
                style={{ fontFamily: "'Playfair Display', serif", color: "white" }}>
                Podem ajudar-te amb...
              </h3>
              <ul className="space-y-2">
                {[
                  "Informació sobre el projecte",
                  "Col·laboracions amb entitats",
                  "Presentacions i activitats",
                  "Premsa i comunicació",
                  "Comandes i enviaments",
                ].map((item, i) => (
                  <li key={i} className="flex items-center gap-2 text-sm"
                    style={{ color: "white", fontFamily: "'Nunito', sans-serif" }}>
                    <Heart size={12} style={{ color: "oklch(0.88 0.06 75)", flexShrink: 0 }} />
                    {item}
                  </li>
                ))}
              </ul>
            </div>

            {/* Cita */}
            <div className="rounded-2xl p-5 text-center"
              style={{
                background: "oklch(0.35 0.07 200 / 0.5)",
                border: "2px solid white/20",
              }}>
              <p className="text-white font-bold leading-relaxed"
                style={{ fontFamily: "'Caveat', cursive", fontSize: "18px" }}>
                "Ja no hi ha on amagar-se,<br />els monstres tenen por"
              </p>
              <p className="text-white/60 text-xs mt-2"
                style={{ fontFamily: "'Nunito', sans-serif" }}>
                — El Mar dins Meu, Montse Marquès
              </p>
            </div>
          </div>

          {/* ── Formulari ── */}
          <div className="lg:col-span-2">
            <div className="rounded-2xl p-8 shadow-xl"
              style={{
                background: "white",
                border: "3px solid oklch(0.88 0.06 75)",
              }}>

              {sent ? (
                /* ── Confirmació d'enviament ── */
                <div className="text-center py-10">
                  <div className="w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-5"
                    style={{ background: "oklch(0.72 0.08 200 / 0.15)" }}>
                    <CheckCircle size={40} style={{ color: "oklch(0.45 0.1 200)" }} />
                  </div>
                  <h3 className="font-black text-2xl mb-3"
                    style={{ fontFamily: "'Playfair Display', serif", color: "oklch(0.3 0.06 50)" }}>
                    Missatge preparat!
                  </h3>
                  <p className="text-base mb-2 max-w-sm mx-auto leading-relaxed"
                    style={{ color: "oklch(0.5 0.05 55)", fontFamily: "'Nunito', sans-serif" }}>
                    S'ha obert el teu client de correu amb el missatge preparat. Envia'l per completar la consulta.
                  </p>
                  <p className="text-sm mb-8"
                    style={{ color: "oklch(0.6 0.04 55)", fontFamily: "'Nunito', sans-serif" }}>
                    Et respondrem en un termini de 2-3 dies hàbils.
                  </p>
                  <div className="flex flex-col sm:flex-row gap-3 justify-center">
                    <button onClick={handleReset}
                      className="px-6 py-3 rounded-xl font-bold text-sm transition-all hover:scale-105"
                      style={{
                        background: "oklch(0.72 0.08 200)",
                        color: "white",
                        fontFamily: "'Nunito', sans-serif",
                      }}>
                      Enviar una altra consulta
                    </button>
                    <Link href="/"
                      className="px-6 py-3 rounded-xl font-bold text-sm transition-all hover:scale-105 text-center"
                      style={{
                        background: "oklch(0.88 0.06 75)",
                        color: "oklch(0.35 0.07 55)",
                        fontFamily: "'Nunito', sans-serif",
                        textDecoration: "none",
                      }}>
                      Tornar a la botiga
                    </Link>
                  </div>
                </div>
              ) : (
                /* ── Formulari ── */
                <form onSubmit={handleSubmit} noValidate>
                  <h3 className="font-black text-xl mb-6"
                    style={{ fontFamily: "'Playfair Display', serif", color: "oklch(0.3 0.06 50)" }}>
                    Envia'ns un missatge
                  </h3>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 mb-5">
                    {/* Nom */}
                    <div>
                      <label style={labelStyle} htmlFor="nom">Nom i cognoms *</label>
                      <input
                        id="nom"
                        name="nom"
                        type="text"
                        value={form.nom}
                        onChange={handleChange}
                        placeholder="El teu nom"
                        style={{
                          ...inputBase,
                          borderColor: errors.nom ? "oklch(0.55 0.2 30)" : "oklch(0.88 0.06 75)",
                        }}
                        onFocus={e => (e.target.style.borderColor = "oklch(0.55 0.1 200)")}
                        onBlur={e => (e.target.style.borderColor = errors.nom ? "oklch(0.55 0.2 30)" : "oklch(0.88 0.06 75)")}
                      />
                      {errors.nom && <p style={errorStyle}>{errors.nom}</p>}
                    </div>

                    {/* Email */}
                    <div>
                      <label style={labelStyle} htmlFor="email">Correu electrònic *</label>
                      <input
                        id="email"
                        name="email"
                        type="email"
                        value={form.email}
                        onChange={handleChange}
                        placeholder="correu@exemple.cat"
                        style={{
                          ...inputBase,
                          borderColor: errors.email ? "oklch(0.55 0.2 30)" : "oklch(0.88 0.06 75)",
                        }}
                        onFocus={e => (e.target.style.borderColor = "oklch(0.55 0.1 200)")}
                        onBlur={e => (e.target.style.borderColor = errors.email ? "oklch(0.55 0.2 30)" : "oklch(0.88 0.06 75)")}
                      />
                      {errors.email && <p style={errorStyle}>{errors.email}</p>}
                    </div>
                  </div>

                  {/* Motiu */}
                  <div className="mb-5">
                    <label style={labelStyle} htmlFor="motiu">Motiu de la consulta *</label>
                    <select
                      id="motiu"
                      name="motiu"
                      value={form.motiu}
                      onChange={handleChange}
                      style={{
                        ...inputBase,
                        borderColor: errors.motiu ? "oklch(0.55 0.2 30)" : "oklch(0.88 0.06 75)",
                        appearance: "none",
                        backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='16' height='16' viewBox='0 0 24 24' fill='none' stroke='%23666' stroke-width='2'%3E%3Cpath d='M6 9l6 6 6-6'/%3E%3C/svg%3E")`,
                        backgroundRepeat: "no-repeat",
                        backgroundPosition: "right 14px center",
                        paddingRight: "40px",
                      }}
                    >
                      <option value="">Selecciona el motiu...</option>
                      {MOTIUS.map(m => (
                        <option key={m} value={m}>{m}</option>
                      ))}
                    </select>
                    {errors.motiu && <p style={errorStyle}>{errors.motiu}</p>}
                  </div>

                  {/* Missatge */}
                  <div className="mb-6">
                    <label style={labelStyle} htmlFor="missatge">
                      Missatge *
                      <span className="font-normal ml-2" style={{ color: "oklch(0.65 0.04 55)" }}>
                        ({form.missatge.length} caràcters)
                      </span>
                    </label>
                    <textarea
                      id="missatge"
                      name="missatge"
                      value={form.missatge}
                      onChange={handleChange}
                      placeholder="Explica'ns la teva consulta amb el màxim de detall possible..."
                      rows={6}
                      style={{
                        ...inputBase,
                        resize: "vertical",
                        minHeight: "140px",
                        borderColor: errors.missatge ? "oklch(0.55 0.2 30)" : "oklch(0.88 0.06 75)",
                      }}
                      onFocus={e => (e.target.style.borderColor = "oklch(0.55 0.1 200)")}
                      onBlur={e => (e.target.style.borderColor = errors.missatge ? "oklch(0.55 0.2 30)" : "oklch(0.88 0.06 75)")}
                    />
                    {errors.missatge && <p style={errorStyle}>{errors.missatge}</p>}
                  </div>

                  {/* Nota privacitat */}
                  <p className="text-xs mb-5 leading-relaxed"
                    style={{ color: "oklch(0.65 0.04 55)", fontFamily: "'Nunito', sans-serif" }}>
                    * Camps obligatoris. Les teves dades s'utilitzen únicament per respondre la teva consulta i no es compartiran amb tercers.
                  </p>

                  {/* Botó enviar */}
                  <button
                    type="submit"
                    disabled={sending}
                    className="w-full flex items-center justify-center gap-3 py-4 rounded-xl font-black text-base transition-all hover:scale-[1.02] disabled:opacity-70 disabled:cursor-not-allowed"
                    style={{
                      background: sending ? "oklch(0.65 0.08 200)" : "oklch(0.55 0.1 200)",
                      color: "white",
                      fontFamily: "'Nunito', sans-serif",
                      boxShadow: "0 4px 20px oklch(0.55 0.1 200 / 0.4)",
                    }}>
                    {sending ? (
                      <>
                        <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        Preparant el missatge...
                      </>
                    ) : (
                      <>
                        <Send size={18} />
                        Enviar consulta
                      </>
                    )}
                  </button>
                </form>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* ===== FOOTER ===== */}
      <footer className="py-8" style={{ background: "oklch(0.35 0.07 200)" }}>
        <div className="container text-center">
          <div className="flex items-center justify-center gap-3 mb-4">
            <BoatIcon size={20} color="rgba(255,255,255,0.7)" />
            <span className="text-white font-bold text-lg"
              style={{ fontFamily: "'Playfair Display', serif" }}>
              El Mar dins Meu
            </span>
          </div>
          <div className="flex justify-center gap-6 mb-4">
            <a href="https://instagram.com/elmardinsmeu" target="_blank" rel="noopener noreferrer"
              className="text-white/60 hover:text-white transition-colors flex items-center gap-2 text-sm">
              <Instagram size={16} />
              <span>Instagram</span>
            </a>
            <a href="mailto:elmardinsmeu@gmail.com"
              className="text-white/60 hover:text-white transition-colors flex items-center gap-2 text-sm">
              <Mail size={16} />
              <span>Contacte</span>
            </a>
          </div>
          <p className="text-white/40 text-xs"
            style={{ fontFamily: "'Nunito', sans-serif" }}>
            © 2026 El Mar dins Meu · Tots els drets reservats
          </p>
        </div>
      </footer>
    </div>
  );
}
