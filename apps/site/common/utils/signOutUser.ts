/**
 * Déconnexion du membre, partagée par le bouton historique (SignInButton) et la nouvelle coquille (carte 081).
 * Membre connecté via le hub : formulaire POST vers /auth/logout, pour fermer aussi la session du hub.
 * Sinon : déconnexion Auth.js, puis retour à l'accueil.
 */
export function signOutUser(hubLogout: boolean) {
  if (hubLogout) {
    // Formulaire POST : le navigateur suit la redirection vers la page de déconnexion du hub
    const form = document.createElement("form");
    form.method = "post";
    form.action = "/auth/logout";
    document.body.appendChild(form);
    form.submit();
    return;
  }
  import("next-auth/react").then(({ signOut }) => {
    signOut({ callbackUrl: "/" });
  });
}
