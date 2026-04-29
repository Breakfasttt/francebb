import { getAvailableRosters } from "../../actions";
import PageHeader from "@/common/components/PageHeader/PageHeader";
import { Plus } from "lucide-react";
import TeamBuilder from "./component/TeamBuilder/TeamBuilder";

export default async function CreateEquipePage() {
  const rosters = await getAvailableRosters();

  return (
    <>
      <PageHeader 
        title="Créer une Équipe" 
        subtitle="Montez votre roster de rêve pour la prochaine saison" 
        icon={<Plus size={24} />} 
        backLink="/equipes" 
      />
      <div className="page-content">
        <TeamBuilder availableRosters={rosters} />
      </div>
    </>
  );
}
