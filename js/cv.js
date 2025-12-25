import { supabase } from "./supabase.js";

function show(el, message) {
  if (!el) return;
  el.textContent = message;
  el.classList.remove("d-none");
}

function hide(el) {
  if (!el) return;
  el.textContent = "";
  el.classList.add("d-none");
}

export function initCvForm() {
  const form = document.getElementById("cvForm");
  if (!form) return;

  const err = document.getElementById("cvError");
  const ok = document.getElementById("cvSuccess");
  const submitBtn = document.getElementById("cvSubmitBtn");

  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    hide(err);
    hide(ok);

    const fd = new FormData(form);
    const firstName = String(fd.get("firstName") || "").trim();
    const lastName = String(fd.get("lastName") || "").trim();
    const email = String(fd.get("email") || "").trim();
    const phone = String(fd.get("phone") || "").trim();
    const domain = String(fd.get("domain") || "").trim();
    const description = String(fd.get("description") || "").trim();
    const file = fd.get("cvFile");

    if (!firstName || !lastName || !email || !phone || !domain || !description) {
      show(err, "Merci de remplir tous les champs.");
      return;
    }

    if (!(file instanceof File) || file.size === 0) {
      show(err, "Merci d’ajouter ton CV au format PDF.");
      return;
    }

    if (file.type !== "application/pdf") {
      show(err, "Le CV doit être au format PDF.");
      return;
    }

    submitBtn?.setAttribute("disabled", "disabled");

    try {
      const safeName = `${Date.now()}_${firstName}_${lastName}`.replace(/[^a-zA-Z0-9_\-]/g, "_");
      const objectPath = `${safeName}.pdf`;

      const { error: uploadError } = await supabase.storage.from("cvs").upload(objectPath, file, {
        contentType: "application/pdf",
        upsert: false,
      });
      if (uploadError) throw uploadError;

      const { error: insertError } = await supabase.from("cvs").insert({
        first_name: firstName,
        last_name: lastName,
        email,
        phone,
        domain,
        description,
        file_path: objectPath,
        file_url: null,
      });
      if (insertError) throw insertError;

      form.reset();
      show(ok, "CV publié avec succès.");
    } catch (e2) {
      let msg = e2?.message || "Erreur lors de la publication du CV.";

      if (String(msg).toLowerCase().includes("bucket") && String(msg).toLowerCase().includes("not found")) {
        try {
          const { data: buckets, error: bucketsErr } = await supabase.storage.listBuckets();
          if (!bucketsErr) {
            const names = (buckets || []).map((b) => b?.name).filter(Boolean).join(", ");
            msg += names ? ` Buckets disponibles: ${names}.` : " Aucun bucket visible avec cette clé.";
          }
        } catch {
          // ignore
        }
      }

      show(err, msg);
    } finally {
      submitBtn?.removeAttribute("disabled");
    }
  });
}

export async function loadCvTable() {
  const body = document.getElementById("cvTableBody");
  if (!body) return;

  body.innerHTML = "";

  const { data, error } = await supabase.from("cvs").select("*").order("created_at", { ascending: false });
  if (error) throw error;

  for (const d of data || []) {
    const tr = document.createElement("tr");

    const name = `${d.last_name || ""} ${d.first_name || ""}`.trim();
    const dateStr = d.created_at ? new Date(d.created_at).toLocaleString("fr-FR") : "";

    let fileUrl = d.file_url || "";
    if (!fileUrl && d.file_path) {
      const { data: signed, error: signedErr } = await supabase.storage
        .from("cvs")
        .createSignedUrl(d.file_path, 60 * 60 * 24 * 7);
      if (!signedErr) fileUrl = signed?.signedUrl || "";
    }

    tr.innerHTML = `
      <td>${escapeHtml(name)}</td>
      <td>${escapeHtml(d.email || "")}</td>
      <td>${escapeHtml(d.phone || "")}</td>
      <td>${escapeHtml(d.domain || "")}</td>
      <td>${escapeHtml(dateStr)}</td>
      <td><a class="btn btn-sm btn-outline-primary" href="${escapeAttr(fileUrl || "#")}" target="_blank" rel="noopener noreferrer">Ouvrir</a></td>
    `;

    body.appendChild(tr);
  }
}

function escapeHtml(str) {
  return String(str)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function escapeAttr(str) {
  return escapeHtml(str).replaceAll("`", "");
}
