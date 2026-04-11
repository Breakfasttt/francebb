import Button, { ButtonProps } from "./Button";

/**
 * Composant pour les boutons "Badge" (ex: Profil, MP dans la sidebar auteur).
 * Plus discret, compact et thémé.
 */
export default function BadgeButton(props: ButtonProps) {
  return <Button {...props} variant="badge" size="xs" />;
}
