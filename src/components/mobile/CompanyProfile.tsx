import { useEffect, useState, useCallback, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "@/hooks/use-toast";
import { ArrowLeft, Save, Upload, FileText, Trash2, Loader2, Download } from "lucide-react";
import { DOC_CATEGORIES, MAX_DOC_BYTES } from "@/lib/library";

interface Props { onBack: () => void }

interface LibDoc {
  id: string; category: string; slot: string | null; label: string;
  file_name: string; storage_path: string;
}

const BLUE = "#0c1c98";
// Champs texte du profil (sauvegardés tels quels).
const TEXT_FIELDS = [
  "name", "forme_juridique", "siret", "rcs", "capital_social", "tva_intra", "code_ape",
  "descriptif", "adresse", "ville", "code_postal", "telephone", "representant",
  "sector", "zone", "tranche_effectif",
] as const;
const NUM_FIELDS = ["ca_n", "ca_n1", "ca_n2", "effectif_n", "effectif_n1", "nb_dirigeants"] as const;
const DATE_FIELDS = ["cloture_n", "cloture_n1", "cloture_n2"] as const;

export function CompanyProfile({ onBack }: Props) {
  const { user } = useAuth();
  const [companyId, setCompanyId] = useState<string | null>(null);
  const [form, setForm] = useState<Record<string, unknown>>({});
  const [docs, setDocs] = useState<LibDoc[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);
  const pending = useRef<{ category: string; slot: string | null; label: string } | null>(null);

  const load = useCallback(async () => {
    if (!user) return;
    const { data } = await supabase.from("companies").select("*").eq("owner_user_id", user.id).maybeSingle();
    if (data) {
      setCompanyId((data as { id: string }).id);
      setForm(data as Record<string, unknown>);
      const { data: d } = await supabase
        .from("library_documents").select("*")
        .eq("company_id", (data as { id: string }).id).order("created_at");
      setDocs((d as LibDoc[] | null) ?? []);
    }
    setLoading(false);
  }, [user]);
  useEffect(() => { load(); }, [load]);

  const set = (k: string, v: string) => setForm((p) => ({ ...p, [k]: v }));
  const val = (k: string) => (form[k] ?? "") as string;

  const save = async () => {
    if (!companyId) return;
    setSaving(true);
    const payload: Record<string, unknown> = {};
    for (const f of TEXT_FIELDS) payload[f] = val(f) || null;
    for (const f of NUM_FIELDS) { const v = val(f); payload[f] = v === "" ? null : Number(v); }
    for (const f of DATE_FIELDS) { const v = val(f); payload[f] = v === "" ? null : v; }
    const { error } = await supabase.from("companies").update(payload as never).eq("id", companyId);
    setSaving(false);
    toast(error
      ? { title: "Échec de l'enregistrement", description: error.message, variant: "destructive" }
      : { title: "Profil enregistré ✅" });
  };

  // ── Documents ──
  const triggerUpload = (category: string, slot: string | null, label: string) => {
    pending.current = { category, slot, label };
    fileRef.current?.click();
  };
  const onFile = async (file: File | null) => {
    const ctx = pending.current;
    if (!file || !ctx || !companyId) return;
    if (file.size > MAX_DOC_BYTES) {
      toast({ title: "Fichier trop volumineux", description: "20 Mo maximum.", variant: "destructive" });
      return;
    }
    const path = `${companyId}/${ctx.category}/${Date.now()}-${file.name}`;
    const { error: upErr } = await supabase.storage.from("company-library").upload(path, file, { contentType: file.type || undefined });
    if (upErr) { toast({ title: "Upload échoué", description: upErr.message, variant: "destructive" }); return; }
    const { error: dbErr } = await supabase.from("library_documents").insert({
      company_id: companyId, category: ctx.category, slot: ctx.slot, label: ctx.label,
      file_name: file.name, storage_path: path, mime_type: file.type || null, size_bytes: file.size,
      uploaded_by: user?.id ?? null,
    } as never);
    if (dbErr) { toast({ title: "Enregistrement échoué", description: dbErr.message, variant: "destructive" }); return; }
    if (fileRef.current) fileRef.current.value = "";
    pending.current = null;
    toast({ title: "Document ajouté" });
    load();
  };
  const openDoc = async (d: LibDoc) => {
    const { data } = await supabase.storage.from("company-library").createSignedUrl(d.storage_path, 120);
    if (data?.signedUrl) window.open(data.signedUrl, "_blank");
  };
  const removeDoc = async (d: LibDoc) => {
    await supabase.storage.from("company-library").remove([d.storage_path]);
    await supabase.from("library_documents").delete().eq("id", d.id);
    load();
  };

  const Field = ({ k, label, type = "text", ph }: { k: string; label: string; type?: string; ph?: string }) => (
    <div className="space-y-1.5">
      <Label htmlFor={k} className="text-xs">{label}</Label>
      <Input id={k} type={type} value={val(k)} placeholder={ph} onChange={(e) => set(k, e.target.value)} className="h-10" />
    </div>
  );

  if (loading) {
    return <div className="p-8 text-center text-muted-foreground"><Loader2 className="w-5 h-5 animate-spin mx-auto" /></div>;
  }

  const SaveBar = (
    <div className="flex justify-end pt-2">
      <Button onClick={save} disabled={saving} className="text-white" style={{ backgroundColor: BLUE }}>
        {saving ? <Loader2 className="w-4 h-4 mr-1.5 animate-spin" /> : <Save className="w-4 h-4 mr-1.5" />}
        Enregistrer
      </Button>
    </div>
  );

  return (
    <div className="min-h-full bg-background">
      <input ref={fileRef} type="file" className="hidden" onChange={(e) => onFile(e.target.files?.[0] ?? null)} />

      <header className="bg-card border-b px-4 py-3 flex items-center gap-3 sticky top-0 z-10">
        <button onClick={onBack} className="text-foreground"><ArrowLeft className="w-5 h-5" /></button>
        <div>
          <h1 className="text-lg font-bold text-foreground leading-tight">Mon entreprise</h1>
          <p className="text-[11px] text-muted-foreground">Le carburant de vos réponses aux marchés.</p>
        </div>
      </header>

      <main className="px-4 py-4 max-w-3xl mx-auto">
        <Tabs defaultValue="admin" className="w-full">
          <TabsList className="w-full grid grid-cols-2 sm:grid-cols-4 h-auto">
            <TabsTrigger value="admin" className="text-xs">Administratif</TabsTrigger>
            <TabsTrigger value="coord" className="text-xs">Coordonnées</TabsTrigger>
            <TabsTrigger value="capa" className="text-xs">Capacités</TabsTrigger>
            <TabsTrigger value="docs" className="text-xs">Librairie</TabsTrigger>
          </TabsList>

          {/* Informations administratives */}
          <TabsContent value="admin" className="space-y-3 pt-4">
            <Field k="name" label="Nom de la société *" />
            <div className="grid grid-cols-2 gap-3">
              <Field k="forme_juridique" label="Forme juridique" />
              <Field k="siret" label="SIRET *" />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <Field k="rcs" label="RCS" />
              <Field k="capital_social" label="Capital social" />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <Field k="tva_intra" label="TVA intra" />
              <Field k="code_ape" label="Code APE" />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="descriptif" className="text-xs">Descriptif de l'entreprise</Label>
              <Textarea id="descriptif" value={val("descriptif")} onChange={(e) => set("descriptif", e.target.value)} rows={4} />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <Field k="sector" label="Secteur / métiers" />
              <Field k="zone" label="Zone d'intervention" />
            </div>
            {SaveBar}
          </TabsContent>

          {/* Coordonnées */}
          <TabsContent value="coord" className="space-y-3 pt-4">
            <Field k="adresse" label="Adresse" />
            <div className="grid grid-cols-2 gap-3">
              <Field k="code_postal" label="Code postal" />
              <Field k="ville" label="Ville" />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <Field k="telephone" label="Téléphone de l'entreprise" />
              <Field k="representant" label="Représentant (signataire)" />
            </div>
            {SaveBar}
          </TabsContent>

          {/* Capacités */}
          <TabsContent value="capa" className="space-y-4 pt-4">
            <div>
              <h3 className="text-sm font-bold text-foreground mb-2">Capacités économiques</h3>
              <div className="grid grid-cols-2 gap-3">
                <Field k="ca_n" label="CA année N (€)" type="number" />
                <Field k="cloture_n" label="Clôture du bilan N" type="date" />
                <Field k="ca_n1" label="CA année N-1 (€)" type="number" />
                <Field k="cloture_n1" label="Clôture N-1" type="date" />
                <Field k="ca_n2" label="CA année N-2 (€)" type="number" />
                <Field k="cloture_n2" label="Clôture N-2" type="date" />
              </div>
            </div>
            <div>
              <h3 className="text-sm font-bold text-foreground mb-2">Capacités techniques</h3>
              <div className="grid grid-cols-2 gap-3">
                <Field k="effectif_n" label="Effectif N" type="number" />
                <Field k="effectif_n1" label="Effectif N-1" type="number" />
                <Field k="nb_dirigeants" label="Nb de dirigeants" type="number" />
                <Field k="tranche_effectif" label="Tranche d'effectif" />
              </div>
            </div>
            {SaveBar}
          </TabsContent>

          {/* Librairie de documents */}
          <TabsContent value="docs" className="space-y-5 pt-4">
            {DOC_CATEGORIES.map((cat) => {
              const catDocs = docs.filter((d) => d.category === cat.id);
              return (
                <div key={cat.id} className="rounded-xl border overflow-hidden">
                  <div className="px-3 py-2 bg-secondary/10 border-b flex items-center justify-between">
                    <div>
                      <span className="text-sm font-bold text-foreground">{cat.label}</span>
                      {cat.hint && <span className="text-[11px] text-muted-foreground ml-2">{cat.hint}</span>}
                    </div>
                    {!cat.slots && (
                      <button onClick={() => triggerUpload(cat.id, null, cat.label)}
                        className="flex items-center gap-1 text-xs font-semibold" style={{ color: BLUE }}>
                        <Upload className="w-3.5 h-3.5" /> Ajouter
                      </button>
                    )}
                  </div>
                  <div className="divide-y">
                    {/* Emplacements prédéfinis */}
                    {cat.slots?.map((slot) => {
                      const doc = catDocs.find((d) => d.slot === slot);
                      return (
                        <div key={slot} className="flex items-center gap-2 px-3 py-2.5 text-sm">
                          <span className="flex-1 text-foreground">{slot}</span>
                          {doc ? (
                            <>
                              <button onClick={() => openDoc(doc)} className="flex items-center gap-1 text-xs text-primary truncate max-w-[40%]">
                                <FileText className="w-3.5 h-3.5 shrink-0" /><span className="truncate">{doc.file_name}</span>
                              </button>
                              <button onClick={() => removeDoc(doc)} className="text-muted-foreground hover:text-destructive"><Trash2 className="w-4 h-4" /></button>
                            </>
                          ) : (
                            <button onClick={() => triggerUpload(cat.id, slot, slot)}
                              className="flex items-center gap-1 text-xs font-semibold" style={{ color: BLUE }}>
                              <Upload className="w-3.5 h-3.5" /> Ajouter un fichier
                            </button>
                          )}
                        </div>
                      );
                    })}
                    {/* Fichiers libres */}
                    {!cat.slots && (catDocs.length === 0 ? (
                      <p className="px-3 py-3 text-xs text-muted-foreground">Aucun fichier. Ajoutez vos documents (max. 20 Mo).</p>
                    ) : catDocs.map((doc) => (
                      <div key={doc.id} className="flex items-center gap-2 px-3 py-2.5 text-sm">
                        <FileText className="w-4 h-4 text-primary shrink-0" />
                        <span className="flex-1 truncate text-foreground">{doc.file_name}</span>
                        <button onClick={() => openDoc(doc)} className="text-muted-foreground hover:text-primary"><Download className="w-4 h-4" /></button>
                        <button onClick={() => removeDoc(doc)} className="text-muted-foreground hover:text-destructive"><Trash2 className="w-4 h-4" /></button>
                      </div>
                    )))}
                  </div>
                </div>
              );
            })}
            <p className="text-[11px] text-muted-foreground text-center">
              Plus votre librairie est complète, plus l'IA rédige des réponses pertinentes.
            </p>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}
