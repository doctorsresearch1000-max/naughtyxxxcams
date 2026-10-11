"use client";

import { useCallback, useEffect, useMemo, useState } from "react";

const TOKEN_KEY = "csn-console-token";

type Tab = "crear" | "continuar" | "tarea" | "resultado" | "mantener";

async function apiFetch(path: string, token: string, init?: RequestInit) {
  const res = await fetch(path, {
    ...init,
    headers: {
      "Content-Type": "application/json",
      "x-csn-console-token": token,
      ...(init?.headers || {}),
    },
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.error || res.statusText);
  return data;
}

export function CsnConsole() {
  const [token, setToken] = useState("");
  const [authed, setAuthed] = useState(false);
  const [tab, setTab] = useState<Tab>("crear");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  type ProjectRow = {
    launchKey: string;
    siteName: string;
    progressPercent: number;
    tasksDone: number;
    tasksTotal: number;
  };
  const [projects, setProjects] = useState<{ production: ProjectRow[]; qa: ProjectRow[] } | null>(null);
  const [selectedKey, setSelectedKey] = useState("");
  const [projectView, setProjectView] = useState<Record<string, unknown> | null>(null);
  const [promptView, setPromptView] = useState<Record<string, unknown> | null>(null);
  const [maintView, setMaintView] = useState<Record<string, unknown> | null>(null);
  const [incidentTitle, setIncidentTitle] = useState("");
  const [createResult, setCreateResult] = useState<Record<string, unknown> | null>(null);

  const [form, setForm] = useState({
    siteName: "",
    domain: "",
    niche: "",
    projectGoal: "",
    projectBrief: "",
    repositoryUrl: "",
    environment: "qa" as "qa" | "production",
  });

  const [resultForm, setResultForm] = useState({
    outcome: "success" as "success" | "failure" | "blocked",
    summary: "",
    evidenceUrls: "",
    advancePhase: false,
  });

  useEffect(() => {
    const t = sessionStorage.getItem(TOKEN_KEY);
    if (t) {
      setToken(t);
      apiFetch("/api/csn/health", t, { method: "GET" })
        .then(() => setAuthed(true))
        .catch(() => sessionStorage.removeItem(TOKEN_KEY));
    }
    const params = new URLSearchParams(window.location.search);
    const lk = params.get("launchKey");
    const ttab = params.get("tab") as Tab | null;
    if (ttab) setTab(ttab);
    if (lk) setSelectedKey(lk);
  }, []);

  const loadProjects = useCallback(async () => {
    const data = await apiFetch("/api/csn/projects", token);
    setProjects(data);
  }, [token]);

  const loadProject = useCallback(
    async (lk: string) => {
      const data = await apiFetch(`/api/csn/projects/${encodeURIComponent(lk)}`, token);
      setProjectView(data);
      setSelectedKey(lk);
    },
    [token],
  );

  useEffect(() => {
    if (!authed) return;
    loadProjects().catch((e) => setError(String(e.message)));
  }, [authed, loadProjects]);

  useEffect(() => {
    if (!authed || !selectedKey) return;
    if (tab === "continuar" || tab === "tarea" || tab === "resultado") {
      loadProject(selectedKey).catch((e) => setError(String(e.message)));
    }
    if (tab === "mantener" && selectedKey) {
      apiFetch(`/api/csn/projects/${encodeURIComponent(selectedKey)}/maintenance`, token)
        .then(setMaintView)
        .catch((e) => setError(String(e.message)));
    }
  }, [authed, selectedKey, tab, token, loadProject]);

  async function login() {
    setError(null);
    try {
      await apiFetch("/api/csn/health", token, { method: "POST" });
      sessionStorage.setItem(TOKEN_KEY, token);
      setAuthed(true);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Acceso denegado");
    }
  }

  async function submitCreate(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError(null);
    setCreateResult(null);
    try {
      const data = await apiFetch("/api/csn/projects", token, {
        method: "POST",
        body: JSON.stringify(form),
      });
      setCreateResult(data);
      setSelectedKey(data.launchKey as string);
      await loadProjects();
      setTab("continuar");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al crear");
    } finally {
      setBusy(false);
    }
  }

  async function generatePrompt() {
    if (!selectedKey) return;
    setBusy(true);
    setError(null);
    try {
      const data = await apiFetch(`/api/csn/projects/${encodeURIComponent(selectedKey)}/prompt`, token, {
        method: "POST",
        body: JSON.stringify({}),
      });
      setPromptView(data);
      setTab("tarea");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al generar prompt");
    } finally {
      setBusy(false);
    }
  }

  async function submitResult(e: React.FormEvent) {
    e.preventDefault();
    if (!selectedKey) return;
    setBusy(true);
    setError(null);
    try {
      const data = await apiFetch(`/api/csn/projects/${encodeURIComponent(selectedKey)}/result`, token, {
        method: "POST",
        body: JSON.stringify(resultForm),
      });
      setProjectView(data.project as Record<string, unknown>);
      setResultForm({ outcome: "success", summary: "", evidenceUrls: "", advancePhase: false });
      alert(`Registrado. Estado tarea: ${(data.record as { taskStatus?: string })?.taskStatus}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al registrar");
    } finally {
      setBusy(false);
    }
  }

  const progressLabel = useMemo(() => {
    const p = projectView?.progress as { percent?: number; note?: string; tasksDone?: number; tasksTotal?: number };
    if (!p) return "Sin datos suficientes";
    if (p.note) return p.note;
    return `${p.percent}% (${p.tasksDone}/${p.tasksTotal} tareas)`;
  }, [projectView]);

  if (!authed) {
    return (
      <main className="mx-auto max-w-md px-4 py-16">
        <h1 className="text-2xl font-semibold mb-2">CSN OS — Consola operativa</h1>
        <p className="text-zinc-400 text-sm mb-6">
          Acceso restringido. Introduce el token de consola (solo servidor; no es la clave de Notion).
        </p>
        <input
          className="w-full rounded border border-zinc-700 bg-zinc-900 px-3 py-2 mb-3"
          type="password"
          placeholder="Token de consola"
          value={token}
          onChange={(e) => setToken(e.target.value)}
        />
        <button
          type="button"
          className="w-full rounded bg-emerald-600 py-2 font-medium hover:bg-emerald-500"
          onClick={login}
        >
          Entrar
        </button>
        {error && <p className="mt-4 text-red-400 text-sm">{error}</p>}
      </main>
    );
  }

  return (
    <main className="mx-auto max-w-3xl px-4 py-8">
      <header className="mb-8">
        <h1 className="text-2xl font-semibold">CSN OS — Consola operativa</h1>
        <p className="text-zinc-400 text-sm mt-1">
          Crear, continuar y mantener proyectos sin memorizar las 14 bases de datos. Las acciones ejecutan el motor CSN en el servidor.
        </p>
      </header>

      <nav className="flex flex-wrap gap-2 mb-6">
        {(
          [
            ["crear", "Crear sitio"],
            ["continuar", "Continuar"],
            ["tarea", "Prompt Cursor"],
            ["resultado", "Registrar resultado"],
            ["mantener", "Mantener"],
          ] as [Tab, string][]
        ).map(([id, label]) => (
          <button
            key={id}
            type="button"
            onClick={() => setTab(id)}
            className={`rounded px-3 py-1.5 text-sm ${tab === id ? "bg-emerald-600" : "bg-zinc-800 hover:bg-zinc-700"}`}
          >
            {label}
          </button>
        ))}
      </nav>

      {error && <p className="mb-4 rounded bg-red-950/50 border border-red-800 px-3 py-2 text-sm text-red-300">{error}</p>}

      {tab === "crear" && (
        <form onSubmit={submitCreate} className="space-y-4">
          <label className="block text-sm">
            Nombre del proyecto *
            <input
              required
              className="mt-1 w-full rounded border border-zinc-700 bg-zinc-900 px-3 py-2"
              value={form.siteName}
              onChange={(e) => setForm({ ...form, siteName: e.target.value })}
            />
          </label>
          <label className="block text-sm">
            Brief del proyecto *
            <textarea
              required
              rows={4}
              className="mt-1 w-full rounded border border-zinc-700 bg-zinc-900 px-3 py-2"
              value={form.projectBrief}
              onChange={(e) => setForm({ ...form, projectBrief: e.target.value })}
            />
          </label>
          <label className="block text-sm">
            Nicho
            <input
              className="mt-1 w-full rounded border border-zinc-700 bg-zinc-900 px-3 py-2"
              value={form.niche}
              onChange={(e) => setForm({ ...form, niche: e.target.value })}
            />
          </label>
          <label className="block text-sm">
            Objetivo
            <input
              className="mt-1 w-full rounded border border-zinc-700 bg-zinc-900 px-3 py-2"
              value={form.projectGoal}
              onChange={(e) => setForm({ ...form, projectGoal: e.target.value })}
            />
          </label>
          <label className="block text-sm">
            Dominio previsto
            <input
              className="mt-1 w-full rounded border border-zinc-700 bg-zinc-900 px-3 py-2"
              value={form.domain}
              onChange={(e) => setForm({ ...form, domain: e.target.value })}
            />
          </label>
          <label className="block text-sm">
            Repositorio Git
            <input
              className="mt-1 w-full rounded border border-zinc-700 bg-zinc-900 px-3 py-2"
              value={form.repositoryUrl}
              onChange={(e) => setForm({ ...form, repositoryUrl: e.target.value })}
            />
          </label>
          <label className="block text-sm">
            Entorno
            <select
              className="mt-1 w-full rounded border border-zinc-700 bg-zinc-900 px-3 py-2"
              value={form.environment}
              onChange={(e) => setForm({ ...form, environment: e.target.value as "qa" | "production" })}
            >
              <option value="qa">QA (prueba)</option>
              <option value="production">Producción</option>
            </select>
          </label>
          <button
            type="submit"
            disabled={busy}
            className="rounded bg-emerald-600 px-4 py-2 font-medium hover:bg-emerald-500 disabled:opacity-50"
          >
            {busy ? "Creando…" : "Crear proyecto en Notion"}
          </button>
          {createResult && (
            <div className="rounded border border-emerald-800 bg-emerald-950/30 p-4 text-sm space-y-2">
              <p>
                <strong>Creado:</strong> launch-key <code>{String(createResult.launchKey)}</code>
              </p>
              <p>
                Tareas: {(createResult.executionTasks as { created?: number })?.created} nuevas,{" "}
                {(createResult.executionTasks as { reused?: number })?.reused} reutilizadas
              </p>
              {(createResult.firstPending as { title?: string })?.title && (
                <p>Primera tarea pendiente: {(createResult.firstPending as { title: string }).title}</p>
              )}
              <button type="button" className="text-emerald-400 underline" onClick={() => setTab("continuar")}>
                Continuar este proyecto
              </button>
            </div>
          )}
        </form>
      )}

      {tab === "continuar" && projects && (
        <div className="space-y-6">
          <section>
            <h2 className="font-medium mb-2">Producción</h2>
            {projects.production.length === 0 ? (
              <p className="text-zinc-500 text-sm">Ningún proyecto de producción.</p>
            ) : (
              <ul className="space-y-2">
                {projects.production.map((p) => (
                  <li key={p.launchKey}>
                    <button
                      type="button"
                      className="w-full text-left rounded border border-zinc-800 px-3 py-2 hover:bg-zinc-900"
                      onClick={() => {
                        setSelectedKey(p.launchKey);
                        loadProject(p.launchKey);
                      }}
                    >
                      {p.siteName} — {p.tasksTotal ? `${p.progressPercent}%` : "Sin datos suficientes"}
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </section>
          <section>
            <h2 className="font-medium mb-2">QA (pruebas)</h2>
            <ul className="space-y-2">
              {projects.qa.map((p) => (
                <li key={p.launchKey}>
                  <button
                    type="button"
                    className="w-full text-left rounded border border-zinc-800 px-3 py-2 hover:bg-zinc-900"
                    onClick={() => {
                      setSelectedKey(p.launchKey);
                      loadProject(p.launchKey);
                    }}
                  >
                    [QA] {p.siteName} — {p.tasksTotal ? `${p.progressPercent}%` : "Sin datos suficientes"}
                  </button>
                </li>
              ))}
            </ul>
          </section>
          {projectView && selectedKey && (
            <div className="rounded border border-zinc-700 p-4 text-sm space-y-2">
              <p><strong>{String(projectView.siteName)}</strong> ({String(projectView.recordClass)})</p>
              <p>Progreso: {progressLabel}</p>
              <p>Fase actual: {String(projectView.currentPhase)} — {String(projectView.phaseNameEs)}</p>
              {(projectView.readiness as { missing?: string[] })?.missing?.length ? (
                <p className="text-amber-400">Bloqueos: {(projectView.readiness as { missing: string[] }).missing.join("; ")}</p>
              ) : null}
              {(projectView.nextTask as { title?: string })?.title && (
                <p>Siguiente tarea: {(projectView.nextTask as { title: string }).title} ({(projectView.nextTask as { status?: string }).status})</p>
              )}
              <div className="flex flex-wrap gap-2 pt-2">
                <button type="button" className="rounded bg-emerald-600 px-3 py-1.5" onClick={generatePrompt} disabled={busy}>
                  Preparar prompt para Cursor
                </button>
                <button type="button" className="rounded bg-zinc-700 px-3 py-1.5" onClick={() => setTab("resultado")}>
                  Registrar resultado
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {tab === "tarea" && (
        <div className="space-y-4">
          {!promptView ? (
            <p className="text-zinc-400 text-sm">Selecciona un proyecto en Continuar y pulsa «Preparar prompt».</p>
          ) : (
            <>
              <p className="text-sm text-zinc-400">{String(promptView.disclaimer)}</p>
              <p className="text-sm">
                <strong>{String(promptView.siteName)}</strong> · Fase {String(promptView.phase)} · Repo: {String(promptView.repositoryUrl || "(pendiente)")}
              </p>
              {(promptView.task as { acceptanceCriteria?: string })?.acceptanceCriteria && (
                <div>
                  <h3 className="font-medium text-sm">Criterios de aceptación</h3>
                  <pre className="text-xs whitespace-pre-wrap bg-zinc-900 p-3 rounded mt-1">
                    {(promptView.task as { acceptanceCriteria: string }).acceptanceCriteria}
                  </pre>
                </div>
              )}
              <button
                type="button"
                className="rounded bg-zinc-700 px-3 py-2 text-sm"
                onClick={() => navigator.clipboard.writeText(String(promptView.markdown))}
              >
                Copiar prompt al portapapeles
              </button>
              {Boolean(promptView.notionUrl) && (
                <a className="text-emerald-400 text-sm block" href={String(promptView.notionUrl)} target="_blank" rel="noreferrer">
                  Abrir prompt en Notion
                </a>
              )}
              <pre className="text-xs whitespace-pre-wrap bg-zinc-900 p-3 rounded max-h-96 overflow-auto border border-zinc-800">
                {String(promptView.markdown).slice(0, 12000)}
              </pre>
            </>
          )}
        </div>
      )}

      {tab === "resultado" && (
        <form onSubmit={submitResult} className="space-y-4">
          <p className="text-sm text-zinc-400">
            Proyecto: <strong>{selectedKey || "(elige uno en Continuar)"}</strong>
            {(projectView?.nextTask as { phase?: number })?.phase != null && (
              <> · Fase {(projectView?.nextTask as { phase: number }).phase}</>
            )}
          </p>
          <label className="block text-sm">
            Resultado
            <select
              className="mt-1 w-full rounded border border-zinc-700 bg-zinc-900 px-3 py-2"
              value={resultForm.outcome}
              onChange={(e) => setResultForm({ ...resultForm, outcome: e.target.value as typeof resultForm.outcome })}
            >
              <option value="success">Éxito verificado (sandbox)</option>
              <option value="failure">Fallo</option>
              <option value="blocked">Bloqueado</option>
            </select>
          </label>
          <label className="block text-sm">
            Resumen
            <textarea
              rows={3}
              className="mt-1 w-full rounded border border-zinc-700 bg-zinc-900 px-3 py-2"
              value={resultForm.summary}
              onChange={(e) => setResultForm({ ...resultForm, summary: e.target.value })}
            />
          </label>
          <label className="block text-sm">
            URLs de evidencia (una por línea; obligatorio si éxito)
            <textarea
              rows={2}
              className="mt-1 w-full rounded border border-zinc-700 bg-zinc-900 px-3 py-2"
              value={resultForm.evidenceUrls}
              onChange={(e) => setResultForm({ ...resultForm, evidenceUrls: e.target.value })}
            />
          </label>
          <label className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={resultForm.advancePhase}
              onChange={(e) => setResultForm({ ...resultForm, advancePhase: e.target.checked })}
            />
            Avanzar a la siguiente fase (solo si el informe es éxito y cumple criterios)
          </label>
          <button type="submit" disabled={busy || !selectedKey} className="rounded bg-emerald-600 px-4 py-2 disabled:opacity-50">
            Registrar en Notion
          </button>
        </form>
      )}

      {tab === "mantener" && (
        <div className="space-y-4">
          <label className="block text-sm">
            Proyecto
            <select
              className="mt-1 w-full rounded border border-zinc-700 bg-zinc-900 px-3 py-2"
              value={selectedKey}
              onChange={(e) => setSelectedKey(e.target.value)}
            >
              <option value="">—</option>
              {[...(projects?.production || []), ...(projects?.qa || [])].map((p) => (
                <option key={p.launchKey} value={p.launchKey}>{p.siteName}</option>
              ))}
            </select>
          </label>
          {maintView && (
            <>
              <p className="text-sm">Incidencias abiertas (aprox.): {String((maintView as { incidentsOpen?: number }).incidentsOpen)} · Mantenimiento: {String((maintView as { maintenanceOpen?: number }).maintenanceOpen)}</p>
              <MaintenanceList title="Incidencias" items={(maintView as { incidents?: { title: string; url: string }[] }).incidents} />
              <MaintenanceList title="Rutinas de mantenimiento" items={(maintView as { maintenance?: { title: string; url: string }[] }).maintenance} />
              <MaintenanceList title="Conocimiento" items={(maintView as { knowledge?: { title: string; url: string }[] }).knowledge} />
              {selectedKey && (
                <form
                  className="border border-zinc-800 rounded p-3 space-y-2"
                  onSubmit={async (e) => {
                    e.preventDefault();
                    if (!incidentTitle.trim()) return;
                    await apiFetch(`/api/csn/projects/${encodeURIComponent(selectedKey)}/maintenance`, token, {
                      method: "POST",
                      body: JSON.stringify({ type: "incident", title: incidentTitle, severity: "SEV3" }),
                    });
                    setIncidentTitle("");
                    const v = await apiFetch(`/api/csn/projects/${encodeURIComponent(selectedKey)}/maintenance`, token);
                    setMaintView(v);
                  }}
                >
                  <p className="text-sm font-medium">Registrar incidencia</p>
                  <input
                    className="w-full rounded border border-zinc-700 bg-zinc-900 px-3 py-2 text-sm"
                    placeholder="Título de la incidencia"
                    value={incidentTitle}
                    onChange={(e) => setIncidentTitle(e.target.value)}
                  />
                  <button type="submit" className="rounded bg-zinc-700 px-3 py-1.5 text-sm">Crear en Notion</button>
                </form>
              )}
            </>
          )}
        </div>
      )}
    </main>
  );
}

function MaintenanceList({ title, items }: { title: string; items?: { title: string; url: string }[] }) {
  if (!items?.length) {
    return <p className="text-sm text-zinc-500">{title}: vacío — puedes registrar una incidencia desde la API o Notion.</p>;
  }
  return (
    <div>
      <h3 className="font-medium text-sm">{title}</h3>
      <ul className="text-sm list-disc pl-5">
        {items.map((i) => (
          <li key={i.url}>
            <a href={i.url} className="text-emerald-400" target="_blank" rel="noreferrer">{i.title}</a>
          </li>
        ))}
      </ul>
    </div>
  );
}
