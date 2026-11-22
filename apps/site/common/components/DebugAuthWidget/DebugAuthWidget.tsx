"use client";

/**
 * Sélecteur de comptes de test, présent seulement en développement (jamais sur le site en ligne).
 * Depuis la carte 204, c'est un bouton à icône de la barre haute (AppShell), sur téléphone comme sur ordinateur, et
 * non plus un bouton flottant qui recouvrait le bas des pages. Il ouvre une fenêtre (Sheet) pour changer de compte ou
 * créer un compte de test. Son nom accessible reste « Dev Auth » : les tests le retrouvent par ce nom.
 * Site en mode hub (22/11/2026) : un bouton en tête lance la vraie connexion par le hub, sans moyen imposé ; le hub
 * propose alors ses propres comptes de test (ceux du passeport, absents de la base du site tant qu'ils ne s'y sont
 * pas connectés). Même chose que le bouton « Comptes de test du hub » de la page de connexion.
 */
import { useState } from "react";
import { signIn } from "next-auth/react";
import { getTestUsers, createQuickTestUser, isDevHubMode } from "@/app/debugActions";
import { Avatar, Button, Field, Input, Select, Sheet, SheetContent } from "@bbfrance/ui";
import { Plus, UserCog } from "lucide-react";

type TestUser = Awaited<ReturnType<typeof getTestUsers>>[number];

export default function DebugAuthWidget({ className }: { className?: string }) {
  const [isOpen, setIsOpen] = useState(false);
  const [testUsers, setTestUsers] = useState<TestUser[]>([]);
  const [newName, setNewName] = useState("");
  const [newRole, setNewRole] = useState("COACH");
  const [loading, setLoading] = useState(false);
  const [hubMode, setHubMode] = useState(false);

  if (process.env.NODE_ENV !== "development") return null;

  const loadUsers = async () => {
    setTestUsers(await getTestUsers());
    setHubMode(await isDevHubMode());
  };

  const handleOpenChange = (open: boolean) => {
    setIsOpen(open);
    if (open) void loadUsers();
  };

  const handleSwitch = async (userId: string) => {
    // On retire l'ancien cookie de simulation s'il existe pour éviter les conflits
    document.cookie = "simulated_user_id=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT";
    // Connexion via Auth.js Credentials
    await signIn("dev-login", { userId, callbackUrl: window.location.pathname });
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName) return;
    setLoading(true);
    try {
      const res = await createQuickTestUser(newName, newRole);
      if (res.success) {
        setNewName("");
        await loadUsers();
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Button
        type="button"
        variant="quiet"
        size="tap-icon"
        aria-label="Dev Auth"
        title="Changer de compte de test (développement)"
        className={className}
        onClick={() => handleOpenChange(true)}
      >
        <UserCog size={22} aria-hidden="true" />
      </Button>

      <Sheet open={isOpen} onOpenChange={handleOpenChange}>
        <SheetContent side="center" title="Comptes de test" description="Développement seulement : se connecter avec un compte de test.">
          <div className="flex flex-col gap-4 overflow-y-auto pb-4">
            {hubMode && (
              <div className="flex flex-col gap-1.5 border-b border-bb-border pb-4">
                <Button type="button" variant="primary" size="tap" className="w-full" onClick={() => signIn("hub", { callbackUrl: window.location.pathname })}>
                  Se connecter avec un compte du hub
                </Button>
                <p className="m-0 text-sm text-bb-text-muted">
                  Le hub affiche ses comptes de test. Déjà connecté au passeport ? Il te reconnecte directement avec ce
                  compte : déconnecte-toi du passeport pour en choisir un autre.
                </p>
              </div>
            )}
            <ul className="m-0 flex list-none flex-col gap-2 p-0">
              {testUsers.length === 0 && <li className="text-center text-sm text-bb-text-muted">Aucun compte de test.</li>}
              {testUsers.map((user) => (
                <li key={user.id}>
                  <Button type="button" variant="secondary" size="tap" className="w-full justify-start gap-3 text-left" onClick={() => handleSwitch(user.id)}>
                    <Avatar name={user.name} src={user.image} size={28} />
                    <span className="flex min-w-0 flex-1 flex-col">
                      <span className="truncate">{user.name}</span>
                      <span className="text-xs font-normal text-bb-text-muted">{user.role}</span>
                    </span>
                  </Button>
                </li>
              ))}
            </ul>

            <form onSubmit={handleCreate} className="flex flex-col gap-3 border-t border-bb-border pt-4">
              <Field label="Créer un compte de test" htmlFor="debug-auth-name">
                <Input id="debug-auth-name" placeholder="Nom du coach" value={newName} onChange={(e) => setNewName(e.target.value)} />
              </Field>
              <div className="flex gap-2">
                <Select aria-label="Rôle du compte" value={newRole} onChange={(e) => setNewRole(e.target.value)} className="flex-1">
                  <option value="COACH">Coach</option>
                  <option value="MODERATOR">Modo</option>
                  <option value="ADMIN">Admin</option>
                  <option value="SUPERADMIN">SuperAdmin</option>
                </Select>
                <Button type="submit" variant="primary" size="tap" disabled={loading || !newName}>
                  <Plus size={18} aria-hidden="true" /> Créer
                </Button>
              </div>
            </form>
          </div>
        </SheetContent>
      </Sheet>
    </>
  );
}
