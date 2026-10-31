/**
 * Liste du passeport (moyens de connexion, applications, appareils) : un nom, un détail, et un bouton facultatif
 * qui passe sous le texte quand la ligne est trop étroite (carte 128).
 */
import { Muted } from "../components/Messages";

export type Item = { key: string; name: string; detail?: string; action?: React.ReactNode };

export default function ItemList({ items }: { items: Item[] }) {
  return (
    <ul className="m-0 flex list-none flex-col gap-3 p-0">
      {items.map((item) => (
        <li key={item.key} className="flex flex-wrap items-center justify-between gap-2 [overflow-wrap:anywhere]">
          <div className="min-w-0 flex-[1_1_200px]">
            <strong>{item.name}</strong>
            {item.detail && <Muted>{item.detail}</Muted>}
          </div>
          {item.action}
        </li>
      ))}
    </ul>
  );
}
