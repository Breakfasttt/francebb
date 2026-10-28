/** Page de preuve du spike A (carte 021) : une utilitaire Tailwind doit gagner sur le reset legacy `* { padding: 0 }`. À supprimer après le spike. */
export default function SpikeTailwindPage() {
  return (
    <div data-testid="tw-probe" className="p-4 mt-2">
      Spike Tailwind v4
    </div>
  );
}
