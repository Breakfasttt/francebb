import Button, { ButtonProps } from "./Button";

/**
 * Composant pour les boutons de type "Toggle / Tab" (ex: Ranking/Matches).
 * Dispose d'un état 'active' qui change radicalement son apparence.
 */
export default function ToggleButton(props: ButtonProps) {
  return <Button {...props} variant="toggle" />;
}
