import { notionLinks } from "./guide-context.mjs";

export function link(label, url) {
  return `[${label}](${url})`;
}

export function n() {
  return notionLinks();
}

export const RELACIONAR_EN_NOTION = `
### Cómo relacionar dos filas en Notion (Site ↔ Project Run, etc.)

1. Abre la fila del **Project Run** (clic en el título de la fila para abrir la página).
2. Busca la propiedad **Site** (tipo «Relation» / relación).
3. Haz clic en el campo vacío → escribe el nombre de tu sitio → elige la ficha que creaste en CSN Sites.
4. Si no aparece, confirma que ya guardaste la fila en CSN Sites y que el nombre coincide.
5. Repite el mismo patrón en otras bases (Domain Candidates, etc.) para enlazar **Site** y **Project Run**.
`;

export const SOP_VERSION_AYUDA = `
### Cómo elegir SOP Version

1. En la fila Project Run, propiedad **SOP Version**.
2. Si ves una sola opción con estado activo o título «Active», selecciónala.
3. Si la lista está vacía: deja el campo vacío, anota en **Notes** «SOP Version pendiente — pedir a administrador» y **no bloquea** seguir el cuaderno y Cursor; solo afecta trazabilidad interna.
`;

export const APROBACION_HUMANA = `
### Aprobaciones humanas (Human Gate)

- **Qué es:** una fila en ${link("Human Gates", notionLinks().humanGates)} que autoriza gasto, compra o deploy.
- **Quién aprueba:** la persona responsable de tu proyecto (propietario del negocio o técnico senior). Si no la conoces, deja **Status = Pending** y en **Notes** del run escribe: «Aprobador pendiente de asignar — no realizar compra/deploy».
- **Cómo continuar sin aprobador:** puedes hacer trabajo que no gaste dinero ni cambie producción (documentación, código en repo, preview local) mientras el Scope del gate lo permita.
`;

export const SIN_REPOSITORIO = `
### Si aún no tienes repositorio de código

**Opción A — Ya tienes cuenta GitHub:** crea un repositorio vacío privado o usa una plantilla Next.js acordada con tu equipo. Copia la URL \`https://github.com/usuario/repo\` al cuaderno.

**Opción B — Usas este stack de referencia (monorepo cam Next.js):** clona o haz fork de \`https://github.com/doctorsresearch1000-max/naughtyxxxcams\` solo si tu alcance lo autoriza (QA). Abre el proyecto en Cursor.

**Opción C — Sin acceso GitHub hoy:** marca en Notion «repo pendiente» y en Día 4 ejecuta solo el prompt de lectura si alguien te pasa un ZIP; **no** puedes marcar CI ni plantilla como «probado» hasta tener el código local.

Etiqueta siempre: **Documentado** | **Implementado** | **Probado** | **Pendiente**.
`;

export const PREVIEW_STAGING = `
### Cómo obtener una URL de preview (staging)

1. **Local (desarrollo):** con el repo abierto en Cursor/terminal, ejecuta lo que indique el README (en este stack suele ser \`npm run dev\` → \`http://localhost:3000\`). Eso es preview **local**, válida como evidencia en QA si la anotas en Notion (no es producción).
2. **Cloudflare Pages (si el proyecto ya está conectado):** en el panel Cloudflare → Pages → tu proyecto → pestaña **Deployments** → abre la URL \`*.pages.dev\` del último deploy de rama preview. Requiere permiso en Cloudflare.
3. **Si no hay deploy:** registra en ${link("CSN Incidents", notionLinks().csnIncidents)} «Preview no disponible — falta deploy» y en Día 7 cierra con checklist **local** probada; no afirmes staging público sin URL.
`;

export function promptFence(body) {
  return "```text\n" + body.trim() + "\n```";
}
