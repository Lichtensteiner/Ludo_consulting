// auth.js
import { supabase, ADMIN_EMAIL } from "./supabase.js";

/* =========================
   Vérifie si l'utilisateur est admin
========================= */
export function isAdmin(user) {
  return !!user?.email && user.email.toLowerCase() === ADMIN_EMAIL.toLowerCase();
}

/* =========================
   Surveille l'état de connexion
========================= */
export function watchAuth(callback) {
  let active = true;

  // Récupère la session actuelle
  supabase.auth.getSession().then(({ data, error }) => {
    if (!active) return;
    if (error) {
      callback(null);
      return;
    }
    callback(data?.session?.user ?? null);
  });

  // Écoute les changements d'authentification
  const { data: sub } = supabase.auth.onAuthStateChange((_event, session) => {
    if (!active) return;
    callback(session?.user ?? null);
  });

  return () => {
    active = false;
    sub?.subscription?.unsubscribe();
  };
}

/* =========================
   Connexion email / mot de passe
========================= */
export async function loginWithEmailPassword(email, password) {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password
  });
  if (error) throw error;
  return data.user;
}

/* =========================
   Connexion avec Google OAuth (CORRIGÉ)
========================= */
export async function loginWithGoogle() {
  const { error } = await supabase.auth.signInWithOAuth({
    provider: "google",
    options: {
      // Fonctionne en local ET en production
      redirectTo: window.location.origin
    }
  });

  if (error) throw error;
}

/* =========================
   Déconnexion
========================= */
export async function logout() {
  const { error } = await supabase.auth.signOut();
  if (error) throw error;
}

/* =========================
   Protection pages utilisateur
========================= */
export function requireAuthOrRedirect(user, redirectTo = "login.html") {
  if (!user) {
    const next = encodeURIComponent(
      location.pathname.split("/").pop() || "index.html"
    );
    location.href = `${redirectTo}?next=${next}`;
    return false;
  }
  return true;
}

/* =========================
   Protection pages admin
========================= */
export function requireAdminOrRedirect(user, redirectTo = "index.html") {
  if (!isAdmin(user)) {
    location.href = redirectTo;
    return false;
  }
  return true;
}
