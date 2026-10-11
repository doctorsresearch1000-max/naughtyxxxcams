# Día 2 — Dominio y entorno de trabajo

## 1. Qué vas a conseguir hoy
- ≥3 candidatos en Notion, historial Wayback, favorito justificado.
- Gate compra **Pending** (sin pagar).
- Plan DNS/hosting documentado.
- **Puedes cerrar el día sin comprar el dominio.**

## 2. Antes de empezar
- Día 1 hecho (run + site).
- Glosario: **dominio**, **dominio expirado**, **Wayback** (web.archive.org), **DNS**, **staging** (prueba, no público final).

## 3. Tiempo y dependencias
- **3–5 h** investigación; compra = días (aprobación).
- **Depende:** gate alcance Día 1 si restringe investigación.


### Aprobaciones humanas (Human Gate)

- **Qué es:** una fila en [Human Gates](https://app.notion.com/p/806256831553451d9c84528f2a3ad654) que autoriza gasto, compra o deploy.
- **Quién aprueba:** la persona responsable de tu proyecto (propietario del negocio o técnico senior). Si no la conoces, deja **Status = Pending** y en **Notes** del run escribe: «Aprobador pendiente de asignar — no realizar compra/deploy».
- **Cómo continuar sin aprobador:** puedes hacer trabajo que no gaste dinero ni cambie producción (documentación, código en repo, preview local) mientras el Scope del gate lo permita.


## 4. Pasos

### Paso 1 — Tres candidatos
- **Qué:** https://www.expireddomains.net/ → Deleted Domains → anota ≥3 nombres.
- **Dónde:** [Domain Candidates](https://app.notion.com/p/6b21261509454bc3b615faca86776831) → New cada uno; Source expireddomains.net; enlaza Site y Project Run.


### Cómo relacionar dos filas en Notion (Site ↔ Project Run, etc.)

1. Abre la fila del **Project Run** (clic en el título de la fila para abrir la página).
2. Busca la propiedad **Site** (tipo «Relation» / relación).
3. Haz clic en el campo vacío → escribe el nombre de tu sitio → elige la ficha que creaste en CSN Sites.
4. Si no aparece, confirma que ya guardaste la fila en CSN Sites y que el nombre coincide.
5. Repite el mismo patrón en otras bases (Domain Candidates, etc.) para enlazar **Site** y **Project Run**.


- **Si falla:** registro en expireddomains → Source manual en Notes.

### Paso 2 — Wayback
- **Qué:** web.archive.org por candidato; Blocked si spam/malware.
- **Dónde:** Notes de cada fila.
- **Si falla:** anotar «sin historial»; no asumir limpio.

### Paso 3 — Comparar

| Criterio | 1 (peor) | 5 (mejor) |
|----------|----------|-----------|
| Encaje con tu nicho | Confuso | Claro para tu público |
| Memorabilidad | Largo o raro | Corto y memorable |
| Historial Wayback | Spam/malware | Limpio o vacío |
| TLD | Poco adecuado | Adecuado al mercado |

Métricas de pago (Ahrefs, etc.): opcionales.

- Marca un favorito **In progress**; frase en [Project Runs](https://app.notion.com/p/d0e397e495e544d28a6899bc6a1e654f) Notes.

### Paso 4 — Gate compra (sin pagar)
- **Qué:** [Human Gates](https://app.notion.com/p/806256831553451d9c84528f2a3ad654) → domain_candidate; Target External ID csn:domain:DOMINIO:EXTERNAL_ID_RUN; Limits USD; **Pending**; STOP checkout.

### Paso 5 — Estado gate
- **Qué:** Nota en run: compra pendiente; captura opcional.

### Paso 6 — Decisión escrita
- **Qué:** Notes favorito ≥50 caracteres; Current Phase 3 en run.

### Paso 7 — Plan DNS
- **Qué:** [CSN Knowledge](https://app.notion.com/p/3d7f94b0d3294789846ab221945c5b85) artículo Runbook «DNS — [sitio]»; sin contraseñas; QA: sin DNS producción.

### Paso 8 — Checklist sandbox
- **Qué:** Notes run: hostnames prueba; «DNS prod: sin cambios».

## 5. Prompts Cursor

### Investigación dominios
```text
# Día 2 — Tabla comparativa dominios (sin Notion)

Yo creo filas en Notion. Tú organizas:
- Nicho: [cuaderno]
- Dominios: [lista]
- Notas Wayback: [pegar]

Entrega: tabla 1-5, párrafo dominio preferido, texto gate compra (Pending, tope USD).
No inventar compra ni Ahrefs.
```

### Plan DNS
```text
# Día 2 — Plan DNS/hosting (documentación)

Repo: [URL o desconocido]
QA o prod: [ ]
Dominio preferido: [ ]

Si hay repo: leer README/wrangler. Tabla DNS sin secretos. QA: sin cambios DNS producción.
Entrega: markdown para CSN Knowledge.
```

## 6. Respuesta esperada de Cursor
- Tablas y textos para pegar; sin afirmar compra.

## 7. Comprobar
- [ ] ≥3 candidatos + Wayback
- [ ] Favorito + gate Pending
- [ ] Plan DNS en Knowledge
- [ ] Sin pago sin Approved

## 8. Si falla
- Todos malos → nuevos candidatos paso 1.
- Gate rechazado → otro dominio.

## 9. Pendiente
- Compra y DNS real → tras Approved.
- **Siguiente:** Día 3 pSEO.
