import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Saisons de Ligue | BBFrance",
  description: "Suivez les saisons et tournois Blood Bowl en cours",
};

export default function SaisonsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="saisons-layout">
      {children}
    </div>
  );
}
