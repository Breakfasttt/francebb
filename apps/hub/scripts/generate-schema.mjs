/**
 * Génère prisma/schema.prisma à partir des tables déclarées par Better Auth et ses plugins (lib/authPlugins.mjs).
 * À relancer après un ajout de plugin ou une montée de version de better-auth, puis `prisma migrate dev`.
 * Remplace le CLI `@better-auth/cli` (pas de dépendance en plus).
 */
import { writeFileSync } from "node:fs";
import { getAuthTables } from "better-auth/db";
import { authPlugins } from "../lib/authPlugins.mjs";

const tables = getAuthTables({ plugins: authPlugins({ sendMagicLink: async () => {} }) });
const modelNameOf = (key) => tables[key].modelName.charAt(0).toUpperCase() + tables[key].modelName.slice(1);

// SQLite : pas de tableau natif, Better Auth stocke string[] et json en texte
const PRISMA_TYPES = { string: "String", boolean: "Boolean", date: "DateTime", number: "Int", json: "String", "string[]": "String" };

const backRelations = {};
const models = Object.entries(tables).map(([key, table]) => {
  const lines = ["  id String @id"];
  for (const [fieldKey, field] of Object.entries(table.fields)) {
    const name = field.fieldName ?? fieldKey;
    const optional = field.required === false ? "?" : "";
    let attributes = "";
    if (field.unique) attributes += " @unique";
    if (field.defaultValue !== undefined && typeof field.defaultValue !== "function") {
      const value = field.defaultValue;
      if (typeof value === "boolean" || typeof value === "number") attributes += ` @default(${value})`;
    }
    if (field.type === "date" && typeof field.defaultValue === "function") attributes += " @default(now())";
    lines.push(`  ${name} ${PRISMA_TYPES[field.type]}${optional}${attributes}`);
    if (field.references) {
      const target = modelNameOf(field.references.model);
      const relationName = `${modelNameOf(key)}_${name}`;
      const onDelete = { cascade: "Cascade", "set null": "SetNull" }[field.references.onDelete] ?? "NoAction";
      lines.push(`  ${name}Ref ${target}${optional} @relation("${relationName}", fields: [${name}], references: [${field.references.field}], onDelete: ${onDelete})`);
      (backRelations[target] ??= []).push(`  ${modelNameOf(key).charAt(0).toLowerCase() + modelNameOf(key).slice(1)}_${name} ${modelNameOf(key)}[] @relation("${relationName}")`);
    }
    if (field.index && !field.unique) lines.push(`  @@index([${name}])`);
  }
  return { name: modelNameOf(key), table: table.modelName, lines };
});

const body = models
  .map((model) => {
    const fields = model.lines.filter((line) => !line.startsWith("  @@"));
    const blocks = model.lines.filter((line) => line.startsWith("  @@"));
    return [`model ${model.name} {`, ...fields, ...(backRelations[model.name] ?? []), ...blocks, `  @@map("${model.table}")`, "}"].join("\n");
  })
  .join("\n\n");

const header = `// GÉNÉRÉ par scripts/generate-schema.mjs depuis les tables Better Auth — ne pas éditer à la main.
// Base du hub d'identité (distincte de la base du site).

generator client {
  provider = "prisma-client-js"
  output   = "./generated-client"
}

datasource db {
  provider = "sqlite"
}
`;
writeFileSync(new URL("../prisma/schema.prisma", import.meta.url), `${header}\n${body}\n`);
console.log(`${models.length} modèles écrits dans prisma/schema.prisma`);
