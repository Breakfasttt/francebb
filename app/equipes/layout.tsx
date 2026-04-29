import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Gérer ses Équipes | BBFrance",
  description: "Création et gestion des équipes Blood Bowl",
};

export default function EquipesLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="equipes-layout">
      {children}
    </div>
  );
}
