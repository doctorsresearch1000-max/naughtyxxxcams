# Día 1 — Define tu proyecto

## 1. Qué vas a conseguir hoy (tangible)
- Brief escrito en lenguaje claro.
- Tres filas en Notion: Project Run, CSN Site, Human Gate (alcance).
- Textos listos para copiar desde Cursor.

## 2. Qué necesitas antes de empezar
- Acceso a [Cam Sites — SOP System](https://app.notion.com/p/Cam-Site-Network-OS-SOP-System-Isolated-3f684cd085ae811fa929c4b4ccbcb56a)
- 45–90 minutos
- Decidir QA vs producción


## Tu cuaderno de proyecto (rellénalo una vez)

- **Nombre del sitio (público):**
- **QA (prueba) o producción:**
- **Nicho y países/idiomas:**
- **Qué debe hacer la web para el visitante (5-10 frases):**
- **Identificador interno (una palabra, ej. mi-cams-2026):**
- **URL del repositorio:** (o «pendiente»)
- **Dominio objetivo:** (o «por decidir»)
- **Responsable de aprobaciones (nombre o «pendiente»):**


## 3. Tiempo y dependencias
- **Tiempo:** 1–2 h
- **Depende de:** nada
- **Puede alargarse:** definir quién aprueba gates


### Aprobaciones humanas (Human Gate)

- **Qué es:** una fila en [Human Gates](https://app.notion.com/p/806256831553451d9c84528f2a3ad654) que autoriza gasto, compra o deploy.
- **Quién aprueba:** la persona responsable de tu proyecto (propietario del negocio o técnico senior). Si no la conoces, deja **Status = Pending** y en **Notes** del run escribe: «Aprobador pendiente de asignar — no realizar compra/deploy».
- **Cómo continuar sin aprobador:** puedes hacer trabajo que no gaste dinero ni cambie producción (documentación, código en repo, preview local) mientras el Scope del gate lo permita.


## 4. Pasos numerados

### Paso 1 — Brief
- **Qué:** Rellena el cuaderno (sobre todo qué hace la web para el visitante).
- **Dónde:** Bloc o Notes del run.
- **Comprobar:** Alguien no técnico lo entiende.
- **Si falla:** Usa el prompt del §5.

### Paso 2 — Project Run
- **Qué:** [Project Runs](https://app.notion.com/p/d0e397e495e544d28a6899bc6a1e654f) → New.
- **Campos:** Run Name; Run Type = QA Sandbox o New Site Launch; Launch Key = identificador; External ID = csn:run:identificador; Status In progress; Current Phase 1.
- **SOP Version:** ver anexo abajo.
- **Comprobar:** Launch Key no vacío.
- **Si falla:** Sin acceso a la base → pedir invitación a Cam Sites SOP System.


### Cómo elegir SOP Version

1. En la fila Project Run, propiedad **SOP Version**.
2. Si ves una sola opción con estado activo o título «Active», selecciónala.
3. Si la lista está vacía: deja el campo vacío, anota en **Notes** «SOP Version pendiente — pedir a administrador» y **no bloquea** seguir el cuaderno y Cursor; solo afecta trazabilidad interna.


### Paso 3 — CSN Sites
- **Qué:** [CSN Sites](https://app.notion.com/p/7b6afa6b844b438f93210cdb8ee728ca) → New → Site Name; Domain = pendiente o dominio futuro; Record Class = QA test-only si es prueba; mismo Launch Key.
- **Relación:** enlaza Site en Project Run.


### Cómo relacionar dos filas en Notion (Site ↔ Project Run, etc.)

1. Abre la fila del **Project Run** (clic en el título de la fila para abrir la página).
2. Busca la propiedad **Site** (tipo «Relation» / relación).
3. Haz clic en el campo vacío → escribe el nombre de tu sitio → elige la ficha que creaste en CSN Sites.
4. Si no aparece, confirma que ya guardaste la fila en CSN Sites y que el nombre coincide.
5. Repite el mismo patrón en otras bases (Domain Candidates, etc.) para enlazar **Site** y **Project Run**.


- **Si falla:** Production marcado por error → corregir a QA test-only.

### Paso 4 — Human Gate alcance
- **Qué:** [Human Gates](https://app.notion.com/p/806256831553451d9c84528f2a3ad654) → New → Target Type project_run; Target External ID = External ID del run; Scope (Notion + código sin compras); Limits 0 USD en QA; Status Pending.
- **Comprobar:** Scope no dice «todo permitido».
- **Si falla:** Sin aprobador → Pending + nota en Notes (ver §8).

## 5. Prompt para Cursor (copiar bloque completo)

```text
# Redactar brief y textos Notion — Día 1

NO tienes acceso a Notion. Solo produces texto para que yo pegue.

Contexto (yo relleno):
- Nombre sitio:
- QA o producción:
- Nicho e idiomas:
- Identificador interno:

Tareas:
1. Mejorar brief (público, propuesta, secciones: home, categorías, perfiles modelo, legales).
2. Proponer Run Name y External ID (csn:run:identificador).
3. Redactar Scope/Limits Human Gate (sin gasto si QA).
4. Checklist final.

No inventar dominio comprado ni deploy.
```

## 6. Qué debe devolver Cursor
- Brief mejorado, textos Scope/Limits, checklist.
- Etiquetas: Documentado (no Implementado en código).

## 7. Cómo comprobar
- [ ] Cuaderno completo
- [ ] Project Run + Site relacionados
- [ ] Human Gate creado (Pending OK)

## 8. Si falla o falta permiso
- Gate Pending: continuar Día 2 solo documentación/dominios si Scope lo permite.
- Sin Notion: guardar textos de Cursor y registrar cuando tengas acceso.

## 9. Hecho vs pendiente
- **Hecho:** brief + filas Notion.
- **Pendiente:** aprobación humana, repo (Día 4), dominio comprado (Día 2+).
