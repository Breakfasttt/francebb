/**
 * Classes qui habillent la carte Leaflet aux couleurs du thème, partagées par la page `/carte` (`CarteClient`) et la
 * petite carte de l'accueil du membre (`LiguesMiniMap`, carte 210). Déplacées telles quelles de `CarteClient.tsx`.
 */
import { cn } from "@bbfrance/ui";

/**
 * Habillage des éléments de Leaflet aux couleurs du thème :
 * - la bulle d'un repère et sa pointe ;
 * - les boutons de zoom, et sur téléphone leur taille de 44 pixels ;
 * - la croix de la bulle, à 44 pixels sur téléphone ;
 * - sur téléphone, la zone qui réagit au toucher autour d'un repère : l'image ne mesure que 25 × 41 pixels, une marge
 *   intérieure de 10 pixels l'agrandit et le décalage `translate` remet l'image exactement à sa place.
 */
export const leafletTheme = cn(
  "[&_.leaflet-container]:font-bb-sans! [&_.leaflet-container]:bg-bb-surface-2!",
  "[&_.leaflet-popup-content-wrapper]:bg-bb-surface! [&_.leaflet-popup-content-wrapper]:text-bb-text! [&_.leaflet-popup-content-wrapper]:rounded-bb-md! [&_.leaflet-popup-tip]:bg-bb-surface!",
  "[&_.leaflet-bar]:border-bb-border! [&_.leaflet-bar_a]:bg-bb-surface! [&_.leaflet-bar_a]:text-bb-text! [&_.leaflet-bar_a]:border-bb-border!",
  "[&_a.leaflet-popup-close-button]:text-bb-text-muted!",
  "max-lg:[&_.leaflet-bar_a]:size-11! max-lg:[&_.leaflet-bar_a]:text-2xl! max-lg:[&_.leaflet-bar_a]:leading-[44px]!",
  "max-lg:[&_a.leaflet-popup-close-button]:size-11! max-lg:[&_a.leaflet-popup-close-button]:text-2xl! max-lg:[&_a.leaflet-popup-close-button]:leading-[44px]! max-lg:[&_.leaflet-popup-content]:mr-11!",
  "max-lg:[&_img.leaflet-marker-icon]:box-content! max-lg:[&_img.leaflet-marker-icon]:p-2.5! max-lg:[&_img.leaflet-marker-icon]:[translate:-10px_-10px]"
);
