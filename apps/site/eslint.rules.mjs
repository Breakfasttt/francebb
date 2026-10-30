// Règles ESLint partagées entre le site (eslint.config.mjs) et les paquets (eslint.packages.config.mjs).

// Un code couleur hexadécimal (#fff, #1a2b3c, #1a2b3c80) écrit en dur dans une chaîne.
// Les couleurs doivent passer par les variables CSS des thèmes (voir ARCHITECTURE.md).
const HEX_COLOR = "/#([0-9a-fA-F]{3,4}|[0-9a-fA-F]{6}|[0-9a-fA-F]{8})\\b/";
const HEX_COLOR_MESSAGE =
  "Code couleur en dur : utiliser une variable CSS des thèmes, par exemple var(--primary) (skill theming-rules).";

// Couleurs : aucun code hexadécimal dans les composants.
export const hexColorRule = [
  "error",
  { selector: `Literal[value=${HEX_COLOR}]`, message: HEX_COLOR_MESSAGE },
  { selector: `TemplateElement[value.raw=${HEX_COLOR}]`, message: HEX_COLOR_MESSAGE },
];

// Boutons et listes déroulantes : utiliser les composants du projet, qui respectent les
// thèmes et la taille minimale de 44 pixels sur téléphone.
export const forbidNativeElementsRule = [
  "error",
  {
    forbid: [
      {
        element: "button",
        message: "utiliser un bouton de common/components/Button, par exemple ClassicButton, ou le Button de @bbfrance/ui (skill ui-components).",
      },
      {
        element: "select",
        message: "utiliser ClassicSelect de common/components/Form (skill ui-components).",
      },
    ],
  },
];
