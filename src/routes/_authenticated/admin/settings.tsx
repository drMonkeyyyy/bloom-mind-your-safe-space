import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useServerFn } from "@tanstack/react-start";
import { updateSettings } from "@/lib/admin.functions";
import { toast } from "sonner";

export const Route = createFileRoute("/_authenticated/admin/settings")({
  component: Page,
});

function Page() {
  const qc = useQueryClient();
  const save = useServerFn(updateSettings);
  const { data: s } = useQuery({
    queryKey: ["settings"],
    queryFn: async () => (await supabase.from("app_settings").select("*").eq("id",1).maybeSingle()).data,
  });
  const [form, setForm] = useState({
    bank_name: "", bank_account_number: "", bank_account_holder: "",
    premium_price: 49000, free_chat_limit: 10, crisis_disclaimer: "",
  });
  useEffect(()=>{ if (s) setForm({
    bank_name: s.bank_name, bank_account_number: s.bank_account_number, bank_account_holder: s.bank_account_holder,
    premium_price: s.premium_price, free_chat_limit: s.free_chat_limit, crisis_disclaimer: s.crisis_disclaimer,
  }); }, [s]);

  const submit = async () => {
    try { await save({ data: form }); toast.success("Settings tersimpan"); qc.invalidateQueries({ queryKey:["settings"] }); }
    catch (e) { toast.error(e instanceof Error?e.message:"Gagal"); }
  };

  return (
    <div className="space-y-5 max-w-xl">
      <h1 className="font-display text-3xl font-semibold">Settings</h1>
      <section className="rounded-3xl bg-card p-6 ring-1 ring-border space-y-3">
        <Field label="Bank" v={form.bank_name} set={(v)=>setForm({...form, bank_name:v})} />
        <Field label="No. Rekening" v={form.bank_account_number} set={(v)=>setForm({...form, bank_account_number:v})} />
        <Field label="Atas Nama" v={form.bank_account_holder} set={(v)=>setForm({...form, bank_account_holder:v})} />
        <Field label="Harga Premium (Rp)" v={String(form.premium_price)} set={(v)=>setForm({...form, premium_price: parseInt(v)||0})} />
        <Field label="Free chat limit / hari" v={String(form.free_chat_limit)} set={(v)=>setForm({...form, free_chat_limit: parseInt(v)||0})} />
        <div>
          <label className="text-xs font-medium uppercase tracking-wider text-muted-foreground">Crisis disclaimer</label>
          <textarea value={form.crisis_disclaimer} onChange={(e)=>setForm({...form, crisis_disclaimer:e.target.value})} rows={4}
            className="mt-1 w-full rounded-2xl border border-border bg-background px-3 py-2 text-sm" />
        </div>
        <button onClick={submit} className="w-full rounded-full bg-accent py-3 text-sm font-semibold text-accent-foreground shadow-peach">Simpan</button>
      </section>
    </div>
  );
}

function Field({ label, v, set }: { label: string; v: string; set: (v: string)=>void }) {
  return (
    <div>
      <label className="text-xs font-medium uppercase tracking-wider text-muted-foreground">{label}</label>
      <input value={v} onChange={(e)=>set(e.target.value)} className="mt-1 w-full rounded-2xl border border-border bg-background px-3 py-2 text-sm" />
    </div>
  );
}
