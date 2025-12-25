import { isAdmin, loginWithEmailPassword, loginWithGoogle, logout, requireAdminOrRedirect, requireAuthOrRedirect, watchAuth } from "./auth.js";
import { initCvForm, loadCvTable } from "./cv.js";

function setYear() {
  const el = document.getElementById("year");
  if (el) el.textContent = String(new Date().getFullYear());
}

function initRevealAnimations() {
  const els = Array.from(document.querySelectorAll(".reveal"));
  if (els.length === 0) return;

  if (!("IntersectionObserver" in window)) {
    for (const el of els) el.classList.add("is-visible");
    return;
  }

  const io = new IntersectionObserver(
    (entries) => {
      for (const entry of entries) {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-visible");
          io.unobserve(entry.target);
        }
      }
    },
    { threshold: 0.12 }
  );

  for (const el of els) io.observe(el);
}

function show(el) { if (!el) return; el.classList.remove("d-none"); }
function hide(el) { if (!el) return; el.classList.add("d-none"); }
function setText(el, text) { if (!el) return; el.textContent = text; }
function getQueryParam(key) { const url = new URL(location.href); return url.searchParams.get(key); }

// Initialisation du formulaire login email/password
function initLoginForm() {
  const form = document.getElementById("loginForm");
  if (!form) return;

  const err = document.getElementById("loginError");
  const ok = document.getElementById("loginSuccess");
  const btn = document.getElementById("loginBtn");

  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    hide(err); hide(ok);

    const email = String(form.email?.value || "").trim();
    const password = String(form.password?.value || "");

    if (!email || !password) {
      setText(err, "Email et mot de passe requis.");
      show(err);
      return;
    }

    btn?.setAttribute("disabled", "disabled");

    try {
      await loginWithEmailPassword(email, password);
      setText(ok, "Connexion réussie.");
      show(ok);

      const next = getQueryParam("next");
      location.href = next ? decodeURIComponent(next) : "portfolio.html";
    } catch (e2) {
      setText(err, e2?.message || "Erreur de connexion.");
      show(err);
    } finally {
      btn?.removeAttribute("disabled");
    }
  });

  // Bouton Google
  const googleBtn = document.getElementById("googleLoginBtn");
  if (googleBtn) {
    googleBtn.addEventListener("click", async () => {
      try {
        await loginWithGoogle(); // redirection automatique vers Supabase
      } catch (e) {
        alert("Erreur Google Login : " + e?.message);
      }
    });
  }
}

// Gestion de l'UI selon utilisateur connecté
function initAuthUi(user) {
  const navUser = document.getElementById("navUser");
  const navLogin = document.getElementById("navLogin");
  const navLogout = document.getElementById("navLogout");
  const navAdmin = document.getElementById("navAdmin");

  if (user) {
    setText(navUser, user.email || "Connecté");
    hide(navLogin);
    show(navLogout);
    if (isAdmin(user)) show(navAdmin);
  } else {
    setText(navUser, "");
    show(navLogin);
    hide(navLogout);
    hide(navAdmin);
  }

  if (navLogout && !navLogout.dataset.bound) {
    navLogout.dataset.bound = "1";
    navLogout.addEventListener("click", async () => {
      await logout();
      location.href = "index.html";
    });
  }
}

// Redirections selon permissions
function enforceGuards(user) {
  const requiresAuth = document.body?.dataset?.requiresAuth === "true";
  const requiresAdmin = document.body?.dataset?.requiresAdmin === "true";

  if (requiresAuth && !requireAuthOrRedirect(user)) return;
  if (requiresAdmin && !requireAdminOrRedirect(user)) return;
}

// Initialisation des fonctionnalités de page
async function initPageFeatures(user) {
  initLoginForm();
  initCvForm();

  if (document.body?.dataset?.requiresAdmin === "true" && isAdmin(user)) {
    try {
      await loadCvTable();
    } catch (e) {
      const adminError = document.getElementById("adminError");
      if (adminError) {
        adminError.textContent = e?.message || "Erreur lors du chargement des CV.";
        adminError.classList.remove("d-none");
      }
    }
  }
}

// Initialisation générale
setYear();
initRevealAnimations();

// Surveillance de l'état de connexion
watchAuth(async (user) => {
  initAuthUi(user);
  enforceGuards(user);
  await initPageFeatures(user);
});
