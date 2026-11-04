/**
 * Page d'accueil de l'application BBScheme, en attendant la relance de l'éditeur de schémas tactiques (carte 179).
 * Le code de l'éditeur est rangé dans `editeur-en-attente/` (voir son README). Texte de 16 pixels au moins et largeur
 * limitée à l'écran : lisible sans zoom sur téléphone.
 */
export default function HomePage() {
  return (
    <main style={{ boxSizing: "border-box", maxWidth: 560, margin: "0 auto", padding: "48px 16px", fontSize: 18, lineHeight: 1.6 }}>
      <h1 style={{ fontSize: 28, margin: "0 0 16px" }}>BBScheme revient bientôt</h1>
      <p style={{ margin: 0 }}>
        L&apos;éditeur de schémas tactiques de Blood Bowl France fait une pause. Les schémas déjà publiés restent visibles
        dans les messages du forum.
      </p>
    </main>
  );
}
