/**
 * Page d'accueil de l'application BBQuizz, en attendant la relance du quiz (carte 180). Le code du quiz est rangé dans
 * `quiz-en-attente/` (voir son README). Texte de 16 pixels au moins et largeur limitée à l'écran : lisible sans zoom
 * sur téléphone.
 */
export default function HomePage() {
  return (
    <main style={{ boxSizing: "border-box", maxWidth: 560, margin: "0 auto", padding: "48px 16px", fontSize: 18, lineHeight: 1.6 }}>
      <h1 style={{ fontSize: 28, margin: "0 0 16px" }}>Le quiz revient bientôt</h1>
      <p style={{ margin: 0 }}>
        Le quiz de Blood Bowl France fait une pause. Les questions et les scores sont gardés : ils seront de retour avec
        lui.
      </p>
    </main>
  );
}
