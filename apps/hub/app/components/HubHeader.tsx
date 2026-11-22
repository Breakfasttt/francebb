/**
 * Barre du haut du hub : même grammaire que le site (fond marine du thème, nom « FRANCE » + « BB » en voix Display),
 * avec la mention « Passeport Blood Bowl ». Le nom mène à l'accueil du hub (le passeport), jamais vers une application :
 * le hub ne connaît aucune application (ADR-0007) ; le retour vers l'application passe par le bouton du passeport.
 */
export default function HubHeader() {
  return (
    <header className="border-b border-bb-nav-border bg-bb-nav-bg">
      <div className="mx-auto flex h-14 w-full max-w-5xl items-center gap-3 px-4 lg:h-16 lg:px-6">
        <a
          href="/"
          aria-label="Passeport Blood Bowl, accueil"
          className="inline-flex min-h-11 items-center rounded-bb-sm font-bb-display text-[26px] leading-none no-underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-bb-focus lg:text-[30px]"
        >
          <span aria-hidden="true">
            <span className="text-bb-nav-text brightness-[1.35]">FRANCE</span>
            <span className="text-bb-logo-accent">BB</span>
          </span>
        </a>
        <span aria-hidden="true" className="h-6 w-px bg-bb-nav-border" />
        <span className="font-bb-heading text-[0.95rem] text-bb-nav-text">Passeport Blood Bowl</span>
      </div>
    </header>
  );
}
